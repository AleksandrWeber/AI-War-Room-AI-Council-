import { criticalPipelineObservabilityEvents } from '@ai-war-room/schemas'
import { describe, expect, it } from 'vitest'
import type { ObservabilityRolloutInput } from './observability-rollout.helpers.js'
import { evaluateObservabilityRollout } from './observability-rollout.helpers.js'

function createInput(
  overrides: Partial<ObservabilityRolloutInput>,
): ObservabilityRolloutInput {
  return {
    nodeEnv: 'test',
    structuredLoggingEnabled: true,
    tracingEnabled: true,
    recentEventBufferCapacity: 200,
    supportedPipelineEvents: [...criticalPipelineObservabilityEvents],
    ...overrides,
  }
}

describe('evaluateObservabilityRollout', () => {
  it('passes when logging, tracing, and pipeline coverage are healthy', () => {
    const rollout = evaluateObservabilityRollout(createInput({}))

    expect(rollout.status).toBe('ready')
  })

  it('fails when pipeline event coverage is incomplete', () => {
    const rollout = evaluateObservabilityRollout(
      createInput({
        supportedPipelineEvents: ['pipeline_phase_completed'],
      }),
    )

    expect(rollout.status).toBe('not_ready')
  })

  it('fails in production when buffer capacity is too small', () => {
    const rollout = evaluateObservabilityRollout(
      createInput({
        nodeEnv: 'production',
        recentEventBufferCapacity: 50,
      }),
    )

    expect(
      rollout.checks.find((check) => check.name === 'production_buffer_capacity')
        ?.status,
    ).toBe('fail')
  })
})
