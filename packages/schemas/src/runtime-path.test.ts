import { describe, expect, it } from 'vitest'
import {
  parseTemporalRuntimePreference,
  resolveApprovedRunRuntime,
  usesTemporalApprovedRunRuntime,
} from './runtime-path.js'

describe('runtime path resolution', () => {
  it('parses frontend runtime preference values', () => {
    expect(parseTemporalRuntimePreference(undefined)).toBe('auto')
    expect(parseTemporalRuntimePreference('auto')).toBe('auto')
    expect(parseTemporalRuntimePreference('true')).toBe('force-on')
    expect(parseTemporalRuntimePreference('false')).toBe('force-off')
  })

  it('forces direct or temporal paths from explicit preferences', () => {
    expect(
      resolveApprovedRunRuntime({
        preference: 'force-on',
        temporalEnabled: false,
      }),
    ).toBe('temporal')
    expect(
      resolveApprovedRunRuntime({
        preference: 'force-off',
        temporalEnabled: true,
      }),
    ).toBe('direct')
  })

  it('uses backend default path in auto mode', () => {
    expect(
      resolveApprovedRunRuntime({
        preference: 'auto',
        temporalEnabled: true,
        defaultPath: 'temporal',
      }),
    ).toBe('temporal')
    expect(
      resolveApprovedRunRuntime({
        preference: 'auto',
        temporalEnabled: false,
        defaultPath: 'direct',
      }),
    ).toBe('direct')
  })

  it('falls back to temporal availability when auto mode has no default path', () => {
    expect(
      resolveApprovedRunRuntime({
        preference: 'auto',
        temporalEnabled: true,
      }),
    ).toBe('temporal')
    expect(
      resolveApprovedRunRuntime({
        preference: 'auto',
        temporalEnabled: false,
      }),
    ).toBe('direct')
  })

  it('detects temporal runtime usage from resolved path', () => {
    expect(usesTemporalApprovedRunRuntime('temporal')).toBe(true)
    expect(usesTemporalApprovedRunRuntime('direct')).toBe(false)
  })
})
