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

type AnthropicMessage = {
  role: 'user' | 'assistant'
  content: string
}

type AnthropicResponse = {
  content?: Array<{
    type: string
    text?: string
  }>
  usage?: {
    input_tokens?: number
    output_tokens?: number
  }
}

@Injectable()
export class AnthropicLlmProvider implements LlmProvider {
  readonly providerId = 'anthropic' as const

  constructor(private readonly configService: ConfigService<ApiEnv, true>) {}

  async completeJson(
    request: LlmProviderRequest,
  ): Promise<LlmProviderResponse> {
    const apiKey = this.configService.get('ANTHROPIC_API_KEY', { infer: true })

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required for Anthropic provider.')
    }

    const response = await fetch(
      this.configService.get('ANTHROPIC_API_URL', { infer: true }),
      {
        method: 'POST',
        headers: {
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          model: request.model,
          max_tokens: 4096,
          temperature: 0.2,
          system: this.createSystemPrompt(request.messages),
          messages: this.createMessages(request.messages),
        }),
        signal: AbortSignal.timeout(
          this.configService.get('LLM_REQUEST_TIMEOUT_MS', { infer: true }),
        ),
      },
    )

    if (!response.ok) {
      throw new Error(
        `Anthropic provider failed with ${response.status}: ${await response.text()}`,
      )
    }

    const body = (await response.json()) as AnthropicResponse
    const rawText = this.extractText(body)
    const inputTokens = body.usage?.input_tokens ?? 0
    const outputTokens = body.usage?.output_tokens ?? 0
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

  private createSystemPrompt(messages: LlmMessage[]) {
    const systemMessages = messages
      .filter((message) => message.role === 'system')
      .map((message) => message.content)

    return [
      ...systemMessages,
      'Return only a valid JSON object. Do not include markdown fences.',
    ].join('\n\n')
  }

  private createMessages(messages: LlmMessage[]): AnthropicMessage[] {
    const nonSystemMessages = messages
      .filter((message) => message.role !== 'system')
      .map((message) => ({
        role: message.role as 'user' | 'assistant',
        content: message.content,
      }))

    return nonSystemMessages.length > 0
      ? nonSystemMessages
      : [{ role: 'user', content: 'Return a valid JSON object.' }]
  }

  private extractText(body: AnthropicResponse) {
    const text = body.content
      ?.filter((block) => block.type === 'text')
      .map((block) => block.text ?? '')
      .join('')
      .trim()

    if (!text) {
      throw new Error('Anthropic provider returned no text content.')
    }

    return text
  }

  private estimateCostUsd(
    model: string,
    inputTokens: number,
    outputTokens: number,
  ) {
    const isHaiku = model.toLowerCase().includes('haiku')
    const inputPerMillion = isHaiku ? 0.8 : 3
    const outputPerMillion = isHaiku ? 4 : 15

    return (
      (inputTokens / 1_000_000) * inputPerMillion +
      (outputTokens / 1_000_000) * outputPerMillion
    )
  }
}
