import { describe, expect, it } from 'vitest'
import type { ObservabilityEvent } from '../observability/observability.service.js'
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
    router: new ModelRouterService(observability as never),
    observability,
  }
}

describe('ModelRouterService', () => {
  it('keeps candidate models from becoming champion before evaluation approval', () => {
    const { router } = createRouter()
    const decision = router.selectModel({
      taskName: 'triage/v1',
      role: 'triage',
    })

    expect(decision.champion.modelId).toBe('mock-json-v1-primary')
    expect(decision.champion.modelId).not.toBe('mock-json-v2-candidate')
    expect(decision.selected.modelId).toBe(decision.champion.modelId)
  })

  it('selects champions per role and records auditable decisions', () => {
    const { router, observability } = createRouter()
    const moderatorDecision = router.selectModel({
      taskName: 'moderator/v1',
      role: 'moderator',
    })
    const securityDecision = router.selectModel({
      taskName: 'agents/security_expert/v1',
      role: 'security_expert',
    })

    expect(moderatorDecision.role).toBe('moderator')
    expect(securityDecision.role).toBe('security_expert')
    expect(observability.events.every((event) => event.eventName === 'model_router_selection')).toBe(
      true,
    )
  })

  it('uses deputy when champion is degraded', () => {
    const { router } = createRouter()
    router.markModelDegraded('mock-json-v1-primary')

    const decision = router.selectModel({
      taskName: 'artifacts/prd/v1',
      role: 'prd',
    })

    expect(decision.champion.modelId).toBe('mock-json-v1-deputy')
    expect(decision.selected.modelId).toBe('mock-json-v1-deputy')
  })

  it('can force deputy after champion failure', () => {
    const { router } = createRouter()
    const decision = router.selectModel({
      taskName: 'agents/critic/v1',
      role: 'critic',
      forceDeputy: true,
    })

    expect(decision.selected.modelId).toBe(decision.deputy?.modelId)
    expect(decision.selectionReason).toBe('deputy_selected_after_champion_failure')
  })
})
