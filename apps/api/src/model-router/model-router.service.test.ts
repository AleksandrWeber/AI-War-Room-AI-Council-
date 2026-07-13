import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import type { ObservabilityEvent } from '../observability/observability.service.js'
import { InMemoryModelRegistryRepository } from './in-memory-model-registry.repository.js'
import { ModelRouterService } from './model-router.service.js'

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

function createRouter() {
  const observability = new TestObservability()

  return {
    router: new ModelRouterService(
      observability as never,
      new InMemoryModelRegistryRepository(),
    ),
    observability,
  }
}

function createConfiguredRouter(config: Partial<ApiEnv>) {
  const observability = new TestObservability()
  const configService = new ConfigService<ApiEnv>({
    LLM_PRIMARY_PROVIDER: 'mock',
    LLM_FALLBACK_PROVIDER: 'mock',
    LLM_PRIMARY_MODEL: 'mock-json-v1',
    LLM_FALLBACK_MODEL: 'mock-json-v1',
    ...config,
  })

  return {
    router: new ModelRouterService(
      observability as never,
      new InMemoryModelRegistryRepository(),
      configService,
    ),
    observability,
  }
}

describe('ModelRouterService', () => {
  it('keeps candidate models from becoming champion before evaluation approval', async () => {
    const { router } = createRouter()
    const decision = await router.selectModel({
      taskName: 'triage/v1',
      role: 'triage',
    })

    expect(decision.champion.modelId).toBe('mock-json-v1-primary')
    expect(decision.champion.modelId).not.toBe('mock-json-v2-candidate')
    expect(decision.selected.modelId).toBe(decision.champion.modelId)
  })

  it('selects champions per role and records auditable decisions', async () => {
    const { router, observability } = createRouter()
    const moderatorDecision = await router.selectModel({
      taskName: 'moderator/v1',
      role: 'moderator',
    })
    const securityDecision = await router.selectModel({
      taskName: 'agents/security_expert/v1',
      role: 'security_expert',
    })

    expect(moderatorDecision.role).toBe('moderator')
    expect(securityDecision.role).toBe('security_expert')
    expect(observability.events.every((event) => event.eventName === 'model_router_selection')).toBe(
      true,
    )
  })

  it('uses deputy when champion is degraded', async () => {
    const { router } = createRouter()
    await router.markModelDegraded('mock-json-v1-primary')
    await router.markModelDegraded('mock-json-v1-primary')
    await router.markModelDegraded('mock-json-v1-primary')

    const decision = await router.selectModel({
      taskName: 'artifacts/prd/v1',
      role: 'prd',
    })

    expect(decision.champion.modelId).toBe('mock-json-v1-deputy')
    expect(decision.selected.modelId).toBe('mock-json-v1-deputy')
  })

  it('can force deputy after champion failure', async () => {
    const { router } = createRouter()
    const decision = await router.selectModel({
      taskName: 'agents/critic/v1',
      role: 'critic',
      forceDeputy: true,
    })

    expect(decision.selected.modelId).toBe(decision.deputy?.modelId)
    expect(decision.selectionReason).toBe('deputy_selected_after_champion_failure')
  })

  it('promotes explicitly configured real providers from candidate to active', async () => {
    const { router } = createConfiguredRouter({
      LLM_PRIMARY_PROVIDER: 'anthropic',
      LLM_FALLBACK_PROVIDER: 'openai',
      LLM_PRIMARY_MODEL: 'claude-3-5-sonnet-latest',
      LLM_FALLBACK_MODEL: 'gpt-4o-mini',
    })

    const models = await router.getRegistrySnapshot()
    const anthropic = models.find((model) => model.providerId === 'anthropic')
    const openai = models.find((model) => model.providerId === 'openai')

    expect(anthropic?.lifecycleStatus).toBe('active')
    expect(anthropic?.modelName).toBe('claude-3-5-sonnet-latest')
    expect(openai?.lifecycleStatus).toBe('active')
    expect(openai?.modelName).toBe('gpt-4o-mini')
  })

  it('persists degradation and recovery health events', async () => {
    const { router } = createRouter()
    await router.markModelDegraded('mock-json-v1-primary', 'timeout')
    await router.markModelDegraded('mock-json-v1-primary', 'timeout')
    await router.markModelDegraded('mock-json-v1-primary', 'timeout')
    let events = await router.getHealthEvents('mock-json-v1-primary')
    let models = await router.getRegistrySnapshot()
    let model = models.find((entry) => entry.modelId === 'mock-json-v1-primary')

    expect(model?.healthStatus).toBe('degraded')
    expect(events[0]?.eventType).toBe('degraded')
    expect(events[0]?.reason).toBe('timeout')

    await router.recoverModel('mock-json-v1-primary', 'manual recovery')
    events = await router.getHealthEvents('mock-json-v1-primary')
    models = await router.getRegistrySnapshot()
    model = models.find((entry) => entry.modelId === 'mock-json-v1-primary')

    expect(model?.healthStatus).toBe('healthy')
    expect(model?.consecutiveFailures).toBe(0)
    expect(events.at(-1)?.eventType).toBe('recovered')
  })
})
