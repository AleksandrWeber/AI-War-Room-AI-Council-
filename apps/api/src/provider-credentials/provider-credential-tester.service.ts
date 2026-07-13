import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { ManagedProviderId } from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'

@Injectable()
export class ProviderCredentialTesterService {
  constructor(private readonly configService: ConfigService<ApiEnv, true>) {}

  async testCredential(input: {
    providerId: ManagedProviderId
    apiKey: string
  }): Promise<void> {
    switch (input.providerId) {
      case 'anthropic':
        await this.testAnthropic(input.apiKey)
        return
      case 'openai':
        await this.testOpenAi(input.apiKey)
        return
      case 'gemini':
        await this.testGemini(input.apiKey)
        return
      case 'tavily':
        await this.testTavily(input.apiKey)
        return
      case 'serper':
        await this.testSerper(input.apiKey)
        return
    }
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

  private async testGemini(apiKey: string) {
    const baseUrl = this.configService
      .get('GEMINI_API_URL', { infer: true })
      .replace(/\/$/, '')
    const response = await fetch(
      `${baseUrl}/models/gemini-2.0-flash:generateContent`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: 'Return {"ok":true} as JSON.' }],
            },
          ],
          generationConfig: {
            temperature: 0,
            responseMimeType: 'application/json',
          },
        }),
        signal: AbortSignal.timeout(
          this.configService.get('LLM_REQUEST_TIMEOUT_MS', { infer: true }),
        ),
      },
    )

    if (!response.ok) {
      throw new Error(`Gemini test failed with ${response.status}.`)
    }
  }

  private async testTavily(apiKey: string) {
    const response = await fetch(
      this.configService.get('TAVILY_API_URL', { infer: true }),
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          api_key: apiKey,
          query: 'ai war room connectivity test',
          search_depth: 'basic',
          include_answer: false,
          max_results: 1,
        }),
        signal: AbortSignal.timeout(
          this.configService.get('LLM_REQUEST_TIMEOUT_MS', { infer: true }),
        ),
      },
    )

    if (!response.ok) {
      throw new Error(`Tavily test failed with ${response.status}.`)
    }
  }

  private async testSerper(apiKey: string) {
    const response = await fetch(
      this.configService.get('SERPER_API_URL', { infer: true }),
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          q: 'ai war room connectivity test',
          num: 1,
        }),
        signal: AbortSignal.timeout(
          this.configService.get('LLM_REQUEST_TIMEOUT_MS', { infer: true }),
        ),
      },
    )

    if (!response.ok) {
      throw new Error(`Serper test failed with ${response.status}.`)
    }
  }
}
