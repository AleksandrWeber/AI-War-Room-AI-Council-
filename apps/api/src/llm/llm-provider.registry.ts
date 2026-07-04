import { Injectable } from '@nestjs/common'
import type { LlmProvider, LlmProviderId } from './llm.types.js'
import { AnthropicLlmProvider } from './anthropic-llm.provider.js'
import { MockLlmProvider } from './mock-llm.provider.js'
import { OpenAiLlmProvider } from './openai-llm.provider.js'

@Injectable()
export class LlmProviderRegistry {
  private readonly providers: Map<LlmProviderId, LlmProvider>

  constructor(
    mockLlmProvider: MockLlmProvider,
    anthropicLlmProvider: AnthropicLlmProvider,
    openAiLlmProvider: OpenAiLlmProvider,
  ) {
    this.providers = new Map(
      [mockLlmProvider, anthropicLlmProvider, openAiLlmProvider].map(
        (provider) => [provider.providerId, provider],
      ),
    )
  }

  getProvider(providerId: LlmProviderId) {
    const provider = this.providers.get(providerId)

    if (!provider) {
      throw new Error(`LLM provider "${providerId}" is not registered.`)
    }

    return provider
  }
}
