import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { ApiEnv } from '../config/env.js'
import type {
  LlmMessage,
  LlmProvider,
  LlmProviderRequest,
  LlmProviderResponse,
} from './llm.types.js'
import { createUsage } from './llm.utils.js'

type GeminiPart = { text?: string }

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[]
    }
  }>
  usageMetadata?: {
    promptTokenCount?: number
    candidatesTokenCount?: number
  }
}

type GeminiContent = {
  role: 'user' | 'model'
  parts: Array<{ text: string }>
}

@Injectable()
export class GeminiLlmProvider implements LlmProvider {
  readonly providerId = 'gemini' as const

  constructor(private readonly configService: ConfigService<ApiEnv, true>) {}

  async completeJson(
    request: LlmProviderRequest,
  ): Promise<LlmProviderResponse> {
    const apiKey =
      request.apiKeyOverride ??
      this.configService.get('GEMINI_API_KEY', { infer: true })

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required for Gemini provider.')
    }

    const baseUrl = this.configService
      .get('GEMINI_API_URL', { infer: true })
      .replace(/\/$/, '')
    const url = `${baseUrl}/models/${encodeURIComponent(request.model)}:generateContent`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(this.buildRequestBody(request.messages)),
      signal: AbortSignal.timeout(
        this.configService.get('LLM_REQUEST_TIMEOUT_MS', { infer: true }),
      ),
    })

    if (!response.ok) {
      throw new Error(
        `Gemini provider failed with ${response.status}: ${await response.text()}`,
      )
    }

    const body = (await response.json()) as GeminiResponse
    const rawText = body.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim()

    if (!rawText) {
      throw new Error('Gemini provider returned no message content.')
    }

    const inputTokens = body.usageMetadata?.promptTokenCount ?? 0
    const outputTokens = body.usageMetadata?.candidatesTokenCount ?? 0
    const usage = createUsage(inputTokens, outputTokens)

    return {
      rawText,
      usage: {
        ...usage,
        estimatedCostUsd: this.estimateCostUsd(
          request.model,
          inputTokens,
          outputTokens,
        ),
      },
      providerId: this.providerId,
      model: request.model,
    }
  }

  private buildRequestBody(messages: LlmMessage[]) {
    const systemTexts = messages
      .filter((message) => message.role === 'system')
      .map((message) => message.content)
    const contents: GeminiContent[] = []

    for (const message of messages) {
      if (message.role === 'system') {
        continue
      }

      const role = message.role === 'assistant' ? 'model' : 'user'
      const last = contents.at(-1)

      if (last?.role === role) {
        last.parts[0]!.text = `${last.parts[0]!.text}\n\n${message.content}`
        continue
      }

      contents.push({
        role,
        parts: [{ text: message.content }],
      })
    }

    if (contents.length === 0 || contents[0]?.role !== 'user') {
      contents.unshift({
        role: 'user',
        parts: [{ text: 'Return a valid JSON object.' }],
      })
    }

    const systemInstruction = [
      ...systemTexts,
      'Return only a valid JSON object. Do not include markdown fences.',
    ].join('\n\n')

    return {
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents,
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    }
  }

  private estimateCostUsd(
    model: string,
    inputTokens: number,
    outputTokens: number,
  ) {
    const isFlash = model.toLowerCase().includes('flash')
    const inputPerMillion = isFlash ? 0.1 : 1.25
    const outputPerMillion = isFlash ? 0.4 : 5

    return (
      (inputTokens / 1_000_000) * inputPerMillion +
      (outputTokens / 1_000_000) * outputPerMillion
    )
  }
}
