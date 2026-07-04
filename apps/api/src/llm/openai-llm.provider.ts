import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { ApiEnv } from '../config/env.js'
import type {
  LlmProvider,
  LlmProviderRequest,
  LlmProviderResponse,
} from './llm.types.js'
import { createUsage } from './llm.utils.js'

type OpenAiResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
  }
}

@Injectable()
export class OpenAiLlmProvider implements LlmProvider {
  readonly providerId = 'openai' as const

  constructor(private readonly configService: ConfigService<ApiEnv, true>) {}

  async completeJson(
    request: LlmProviderRequest,
  ): Promise<LlmProviderResponse> {
    const apiKey =
      request.apiKeyOverride ??
      this.configService.get('OPENAI_API_KEY', { infer: true })

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required for OpenAI provider.')
    }

    const response = await fetch(
      this.configService.get('OPENAI_API_URL', { infer: true }),
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model,
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            ...request.messages,
            {
              role: 'system',
              content:
                'Return only a valid JSON object. Do not include markdown fences.',
            },
          ],
        }),
        signal: AbortSignal.timeout(
          this.configService.get('LLM_REQUEST_TIMEOUT_MS', { infer: true }),
        ),
      },
    )

    if (!response.ok) {
      throw new Error(
        `OpenAI provider failed with ${response.status}: ${await response.text()}`,
      )
    }

    const body = (await response.json()) as OpenAiResponse
    const rawText = body.choices?.[0]?.message?.content?.trim()

    if (!rawText) {
      throw new Error('OpenAI provider returned no message content.')
    }

    const inputTokens = body.usage?.prompt_tokens ?? 0
    const outputTokens = body.usage?.completion_tokens ?? 0
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

  private estimateCostUsd(
    model: string,
    inputTokens: number,
    outputTokens: number,
  ) {
    const isMini = model.toLowerCase().includes('mini')
    const inputPerMillion = isMini ? 0.15 : 2.5
    const outputPerMillion = isMini ? 0.6 : 10

    return (
      (inputTokens / 1_000_000) * inputPerMillion +
      (outputTokens / 1_000_000) * outputPerMillion
    )
  }
}
