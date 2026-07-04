import { Injectable } from '@nestjs/common'
import type {
  LlmProvider,
  LlmProviderRequest,
  LlmProviderResponse,
} from './llm.types.js'
import {
  createUsage,
  estimateMessageTokens,
  estimateTokens,
} from './llm.utils.js'

const mockJsonPrefix = 'MOCK_JSON:'

@Injectable()
export class MockLlmProvider implements LlmProvider {
  readonly providerId = 'mock' as const

  async completeJson(
    request: LlmProviderRequest,
  ): Promise<LlmProviderResponse> {
    const rawText = this.resolveMockJson(request)

    return {
      rawText,
      usage: createUsage(
        estimateMessageTokens(request.messages),
        estimateTokens(rawText),
      ),
      providerId: this.providerId,
      model: request.model,
    }
  }

  private resolveMockJson(request: LlmProviderRequest) {
    const explicitMock = [...request.messages]
      .reverse()
      .map((message) => message.content)
      .find((content) => content.includes(mockJsonPrefix))

    if (explicitMock) {
      return explicitMock.slice(
        explicitMock.indexOf(mockJsonPrefix) + mockJsonPrefix.length,
      )
    }

    return JSON.stringify({
      summary: `Mock response for ${request.taskName}`,
    })
  }
}
