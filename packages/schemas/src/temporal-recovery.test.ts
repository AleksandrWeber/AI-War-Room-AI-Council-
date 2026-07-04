import { describe, expect, it } from 'vitest'
import {
  createTemporalObservationTimeoutMessage,
  formatTemporalFailureMessage,
  getTemporalRecoveryHint,
  isTemporalActiveStatus,
  isTemporalTerminalStatus,
} from './temporal-recovery.js'

describe('temporal recovery helpers', () => {
  it('classifies active and terminal workflow statuses', () => {
    expect(isTemporalActiveStatus('running')).toBe(true)
    expect(isTemporalActiveStatus('unknown')).toBe(true)
    expect(isTemporalActiveStatus('completed')).toBe(false)
    expect(isTemporalTerminalStatus('failed')).toBe(true)
    expect(isTemporalTerminalStatus('running')).toBe(false)
    expect(isTemporalTerminalStatus('disabled')).toBe(false)
  })

  it('maps terminal statuses to actionable failure messages', () => {
    expect(formatTemporalFailureMessage('failed')).toContain('worker logs')
    expect(formatTemporalFailureMessage('timed_out')).toContain('timeout')
    expect(formatTemporalFailureMessage('canceled')).toContain('canceled')
  })

  it('returns recovery hints for synced and persisted-only states', () => {
    expect(getTemporalRecoveryHint('running', true)).toContain('still running')
    expect(getTemporalRecoveryHint('running', false)).toContain('persisted')
    expect(getTemporalRecoveryHint('completed', true)).toContain('completed')
    expect(getTemporalRecoveryHint('failed', true)).toContain('failed')
  })

  it('creates an observation timeout message with seconds', () => {
    expect(createTemporalObservationTimeoutMessage(300_000)).toContain('300s')
  })
})
