import { Injectable } from '@nestjs/common'
import type { LlmProvider, LlmProviderId } from './llm.types.js'
import { AnthropicLlmProvider } from './anthropic-llm.provider.js'
import { CursorLlmProvider } from './cursor-llm.provider.js'
import { GeminiLlmProvider } from './gemini-llm.provider.js'
import { MockLlmProvider } from './mock-llm.provider.js'
import { OpenAiLlmProvider } from './openai-llm.provider.js'
import { OpenRouterLlmProvider } from './openrouter-llm.provider.js'

@Injectable()
export class LlmProviderRegistry {
  private readonly providers: Map<LlmProviderId, LlmProvider>

  constructor(
    mockLlmProvider: MockLlmProvider,
    anthropicLlmProvider: AnthropicLlmProvider,
    openAiLlmProvider: OpenAiLlmProvider,
    geminiLlmProvider: GeminiLlmProvider,
    cursorLlmProvider: CursorLlmProvider,
    openRouterLlmProvider: OpenRouterLlmProvider,
  ) {
    this.providers = new Map(
      [
        mockLlmProvider,
        anthropicLlmProvider,
        openAiLlmProvider,
        geminiLlmProvider,
        cursorLlmProvider,
        openRouterLlmProvider,
      ].map((provider) => [provider.providerId, provider]),
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
