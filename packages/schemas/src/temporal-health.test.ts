import { describe, expect, it } from 'vitest'
import {
  getTemporalHealthGuidance,
  resolveTemporalRuntimeHealthStatus,
} from './temporal-health.js'

describe('temporal health helpers', () => {
  it('resolves runtime health status from server and worker signals', () => {
    expect(
      resolveTemporalRuntimeHealthStatus({
        temporalEnabled: false,
        serverReachable: false,
        workerPolling: false,
      }),
    ).toBe('disabled')
    expect(
      resolveTemporalRuntimeHealthStatus({
        temporalEnabled: true,
        serverReachable: false,
        workerPolling: false,
      }),
    ).toBe('unavailable')
    expect(
      resolveTemporalRuntimeHealthStatus({
        temporalEnabled: true,
        serverReachable: true,
        workerPolling: false,
      }),
    ).toBe('degraded')
    expect(
      resolveTemporalRuntimeHealthStatus({
        temporalEnabled: true,
        serverReachable: true,
        workerPolling: true,
      }),
    ).toBe('healthy')
  })

  it('returns actionable guidance for each health status', () => {
    expect(getTemporalHealthGuidance('degraded')).toContain('worker')
    expect(getTemporalHealthGuidance('healthy')).toContain('healthy')
  })
})
