import { Injectable } from '@nestjs/common'
import type { LlmProvider, LlmProviderId } from './llm.types.js'
import { MockLlmProvider } from './mock-llm.provider.js'

@Injectable()
export class LlmProviderRegistry {
  private readonly providers: Map<LlmProviderId, LlmProvider>

  constructor(mockLlmProvider: MockLlmProvider) {
    this.providers = new Map([[mockLlmProvider.providerId, mockLlmProvider]])
  }

  getProvider(providerId: LlmProviderId) {
    const provider = this.providers.get(providerId)

    if (!provider) {
      throw new Error(`LLM provider "${providerId}" is not registered.`)
    }

    return provider
  }
}
