import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import type { ApiEnv } from '../config/env.js'
import type { ObservabilityEvent } from '../observability/observability.service.js'
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
  readonly requests: LlmProviderRequest[] = []
  private calls = 0

  constructor(
    providerId: LlmProviderId,
    private readonly responses: Array<string | Error>,
  ) {
    this.providerId = providerId
  }

  async completeJson(
    request: LlmProviderRequest,
  ): Promise<LlmProviderResponse> {
    this.requests.push(request)
    const rawText =
      this.responses[Math.min(this.calls, this.responses.length - 1)] ??
      '{}'
    this.calls += 1

    if (rawText instanceof Error) {
      throw rawText
    }

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

class TestObservability {
  readonly events: ObservabilityEvent[] = []

  record(
    eventName: string,
    attributes: ObservabilityEvent['attributes'],
    level: ObservabilityEvent['level'] = 'info',
  ) {
    const event = {
      eventName,
      level,
      timestamp: new Date().toISOString(),
      attributes,
    }
    this.events.push(event)

    return event
  }
}

class TestModelRouter {
  private sequence = 0
  readonly degradedModelIds: string[] = []

  constructor(private readonly providerId: LlmProviderId = 'mock') {}

  selectModel(input: { taskName: string; role: string; forceDeputy?: boolean }) {
    this.sequence += 1
    const modelId = input.forceDeputy
      ? 'mock-json-v1-deputy'
      : 'mock-json-v1-primary'
    const selected = {
      modelId,
      providerId: this.providerId,
      modelName: input.forceDeputy ? 'deputy-model' : 'primary-model',
      score: input.forceDeputy ? 0.8 : 0.9,
      lifecycleStatus: 'active',
      healthStatus: 'healthy',
    }

    return {
      decisionId: `decision_${this.sequence}`,
      taskName: input.taskName,
      role: input.role,
      champion: {
        modelId: 'mock-json-v1-primary',
        providerId: this.providerId,
        modelName: 'primary-model',
        score: 0.9,
        lifecycleStatus: 'active',
        healthStatus: 'healthy',
      },
      deputy: {
        modelId: 'mock-json-v1-deputy',
        providerId: this.providerId,
        modelName: 'deputy-model',
        score: 0.8,
        lifecycleStatus: 'active',
        healthStatus: 'healthy',
      },
      selected,
      selectionReason: input.forceDeputy
        ? 'deputy_selected_after_champion_failure'
        : 'champion_selected_by_role_score',
      candidateCount: 2,
      createdAt: new Date().toISOString(),
    }
  }

  markModelDegraded(modelId: string) {
    this.degradedModelIds.push(modelId)
  }
}

class TestProviderCredentials {
  constructor(private readonly apiKey: string | null = null) {}

  async resolveApiKey() {
    return this.apiKey
  }
}

function createGateway(
  providers: LlmProvider[],
  apiKey: string | null = null,
  selectedProviderId: LlmProviderId = 'mock',
) {
  const config = new ConfigService<ApiEnv>({
    LLM_PRIMARY_PROVIDER: 'mock',
    LLM_FALLBACK_PROVIDER: 'mock',
    LLM_PRIMARY_MODEL: 'primary-model',
    LLM_FALLBACK_MODEL: 'fallback-model',
    LLM_MAX_ATTEMPTS: 3,
  })

  const observability = new TestObservability()
  const modelRouter = new TestModelRouter(selectedProviderId)
  const gateway = new LlmGatewayService(
    config,
    new TestRegistry(
      new Map(providers.map((provider) => [provider.providerId, provider])),
    ) as never,
    observability as never,
    modelRouter as never,
    new TestProviderCredentials(apiKey) as never,
  )

  return { gateway, observability, modelRouter }
}

describe('LlmGatewayService', () => {
  it('returns valid structured JSON on the first attempt', async () => {
    const { gateway, observability } = createGateway([
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
    expect(observability.events[0].eventName).toBe('llm_call_completed')
  })

  it('repairs after invalid JSON by retrying through the gateway', async () => {
    const { gateway, observability } = createGateway([
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
    expect(result.model).toBe('deputy-model')
    expect(result.errors[0]).toContain('JSON object')
    expect(result.value.summary).toBe('Repaired response')
    expect(observability.events.map((event) => event.eventName)).toEqual([
      'llm_validation_failure',
      'llm_call_completed',
    ])
  })

  it('returns a safe fallback after repeated schema validation failures', async () => {
    const { gateway, observability } = createGateway([
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
    expect(observability.events.map((event) => event.eventName)).toEqual([
      'llm_validation_failure',
      'llm_validation_failure',
      'llm_fallback_used',
    ])
  })

  it('routes from champion to deputy after a provider failure', async () => {
    const { gateway, observability, modelRouter } = createGateway([
      new ScriptedProvider('mock', [
        new Error('champion unavailable'),
        JSON.stringify({
          summary: 'Deputy response',
          risks: [],
        }),
      ]),
    ])

    const result = await gateway.generateStructuredJson({
      taskName: 'test',
      schema: responseSchema,
      messages: [{ role: 'user', content: 'Return JSON.' }],
      fallback: { summary: 'fallback', risks: [] },
      maxAttempts: 2,
    })

    expect(result.validationStatus).toBe('repaired')
    expect(result.model).toBe('deputy-model')
    expect(modelRouter.degradedModelIds).toEqual(['mock-json-v1-primary'])
    expect(observability.events.map((event) => event.eventName)).toEqual([
      'llm_provider_failure',
      'llm_call_completed',
    ])
  })

  it('passes workspace provider keys to real provider requests', async () => {
    const provider = new ScriptedProvider('anthropic', [
      JSON.stringify({
        summary: 'Workspace credential response',
        risks: [],
      }),
    ])
    const { gateway } = createGateway(
      [provider],
      'workspace-secret-key',
      'anthropic',
    )

    const result = await gateway.generateStructuredJson({
      taskName: 'test',
      schema: responseSchema,
      messages: [{ role: 'user', content: 'Return JSON.' }],
      fallback: { summary: 'fallback', risks: [] },
      workspaceId: 'workspace_1',
    })

    expect(result.validationStatus).toBe('valid')
    expect(provider.requests[0]?.workspaceId).toBe('workspace_1')
    expect(provider.requests[0]?.apiKeyOverride).toBe('workspace-secret-key')
  })
})
