import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import type { ApiEnv } from '../config/env.js'
import { LlmGatewayService } from './llm-gateway.service.js'
import type {
  LlmProvider,
  LlmProviderId,
  LlmProviderRequest,
  LlmProviderResponse,
} from './llm.types.js'
import { createUsage } from './llm.utils.js'

const responseSchema = z.object({
  summary: z.string(),
  risks: z.array(z.string()),
})

class ScriptedProvider implements LlmProvider {
  readonly providerId: LlmProviderId
  private calls = 0

  constructor(
    providerId: LlmProviderId,
    private readonly responses: string[],
  ) {
    this.providerId = providerId
  }

  async completeJson(
    request: LlmProviderRequest,
  ): Promise<LlmProviderResponse> {
    const rawText =
      this.responses[Math.min(this.calls, this.responses.length - 1)] ??
      '{}'
    this.calls += 1

    return {
      rawText,
      usage: createUsage(10, 5),
      providerId: this.providerId,
      model: request.model,
    }
  }
}

class TestRegistry {
  constructor(private readonly providers: Map<LlmProviderId, LlmProvider>) {}

  getProvider(providerId: LlmProviderId) {
    const provider = this.providers.get(providerId)

    if (!provider) {
      throw new Error(`Provider ${providerId} missing`)
    }

    return provider
  }
}

function createGateway(providers: LlmProvider[]) {
  const config = new ConfigService<ApiEnv>({
    LLM_PRIMARY_PROVIDER: 'mock',
    LLM_FALLBACK_PROVIDER: 'mock',
    LLM_PRIMARY_MODEL: 'primary-model',
    LLM_FALLBACK_MODEL: 'fallback-model',
    LLM_MAX_ATTEMPTS: 3,
  })

  return new LlmGatewayService(
    config,
    new TestRegistry(
      new Map(providers.map((provider) => [provider.providerId, provider])),
    ) as never,
  )
}

describe('LlmGatewayService', () => {
  it('returns valid structured JSON on the first attempt', async () => {
    const gateway = createGateway([
      new ScriptedProvider('mock', [
        JSON.stringify({
          summary: 'Valid response',
          risks: ['risk'],
        }),
      ]),
    ])

    const result = await gateway.generateStructuredJson({
      taskName: 'test',
      schema: responseSchema,
      messages: [{ role: 'user', content: 'Return JSON.' }],
      fallback: { summary: 'fallback', risks: [] },
    })

    expect(result.validationStatus).toBe('valid')
    expect(result.attempts).toBe(1)
    expect(result.value.summary).toBe('Valid response')
    expect(result.usage.totalTokens).toBeGreaterThan(0)
  })

  it('repairs after invalid JSON by retrying through the gateway', async () => {
    const gateway = createGateway([
      new ScriptedProvider('mock', [
        'not json',
        JSON.stringify({
          summary: 'Repaired response',
          risks: [],
        }),
      ]),
    ])

    const result = await gateway.generateStructuredJson({
      taskName: 'test',
      schema: responseSchema,
      messages: [{ role: 'user', content: 'Return JSON.' }],
      fallback: { summary: 'fallback', risks: [] },
    })

    expect(result.validationStatus).toBe('repaired')
    expect(result.attempts).toBe(2)
    expect(result.errors[0]).toContain('JSON object')
    expect(result.value.summary).toBe('Repaired response')
  })

  it('returns a safe fallback after repeated schema validation failures', async () => {
    const gateway = createGateway([
      new ScriptedProvider('mock', [
        JSON.stringify({ summary: 123 }),
        JSON.stringify({ nope: true }),
      ]),
    ])

    const result = await gateway.generateStructuredJson({
      taskName: 'test',
      schema: responseSchema,
      messages: [{ role: 'user', content: 'Return JSON.' }],
      fallback: { summary: 'fallback', risks: ['schema failed'] },
      maxAttempts: 2,
    })

    expect(result.validationStatus).toBe('fallback')
    expect(result.attempts).toBe(2)
    expect(result.value.summary).toBe('fallback')
    expect(result.errors.length).toBe(2)
  })
})
