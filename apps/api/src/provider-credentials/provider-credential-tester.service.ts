import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { ManagedLlmProviderId } from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'

@Injectable()
export class ProviderCredentialTesterService {
  constructor(private readonly configService: ConfigService<ApiEnv, true>) {}

  async testCredential(input: {
    providerId: ManagedLlmProviderId
    apiKey: string
  }): Promise<void> {
    if (input.providerId === 'anthropic') {
      await this.testAnthropic(input.apiKey)
      return
    }

    await this.testOpenAi(input.apiKey)
  }

  private async testAnthropic(apiKey: string) {
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
          model: 'claude-3-5-haiku-latest',
          max_tokens: 64,
          temperature: 0,
          messages: [{ role: 'user', content: 'Return {"ok":true} as JSON.' }],
        }),
        signal: AbortSignal.timeout(
          this.configService.get('LLM_REQUEST_TIMEOUT_MS', { infer: true }),
        ),
      },
    )

    if (!response.ok) {
      throw new Error(`Anthropic test failed with ${response.status}.`)
    }
  }

  private async testOpenAi(apiKey: string) {
    const response = await fetch(
      this.configService.get('OPENAI_API_URL', { infer: true }),
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0,
          response_format: { type: 'json_object' },
          messages: [{ role: 'user', content: 'Return {"ok":true} as JSON.' }],
        }),
        signal: AbortSignal.timeout(
          this.configService.get('LLM_REQUEST_TIMEOUT_MS', { infer: true }),
        ),
      },
    )

    if (!response.ok) {
      throw new Error(`OpenAI test failed with ${response.status}.`)
    }
  }
}
