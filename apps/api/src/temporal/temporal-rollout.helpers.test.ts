import { describe, expect, it } from 'vitest'
import type { TemporalRolloutInput } from './temporal-rollout.helpers.js'
import { evaluateTemporalRollout } from './temporal-rollout.helpers.js'

function createInput(overrides: Partial<TemporalRolloutInput>): TemporalRolloutInput {
  return {
    nodeEnv: 'production',
    temporalEnabled: true,
    temporalAddress: 'temporal.prod.example:7233',
    temporalNamespace: 'production',
    temporalTaskQueue: 'ai-war-room-runs',
    workflowStreamPollMs: 1_000,
    workflowStreamTimeoutMs: 300_000,
    serverReachable: true,
    workerPolling: true,
    ...overrides,
  }
}

describe('evaluateTemporalRollout', () => {
  it('returns disabled rollout when temporal is off', () => {
    const rollout = evaluateTemporalRollout(
      createInput({
        temporalEnabled: false,
      }),
    )

    expect(rollout.status).toBe('disabled')
  })

  it('passes production temporal rollout checks', () => {
    const rollout = evaluateTemporalRollout(createInput({}))

    expect(rollout.status).toBe('ready')
  })

  it('fails production rollout when temporal address is local', () => {
    const rollout = evaluateTemporalRollout(
      createInput({
        temporalAddress: '127.0.0.1:7233',
      }),
    )

    expect(rollout.status).toBe('not_ready')
    expect(rollout.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'production_address',
          status: 'fail',
        }),
      ]),
    )
  })

  it('fails rollout when worker heartbeat is missing', () => {
    const rollout = evaluateTemporalRollout(
      createInput({
        workerPolling: false,
      }),
    )

    expect(rollout.status).toBe('not_ready')
    expect(rollout.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'temporal_worker_polling',
          status: 'fail',
        }),
      ]),
    )
  })
})
