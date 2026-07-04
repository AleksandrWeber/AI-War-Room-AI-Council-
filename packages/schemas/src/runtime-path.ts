import type { ApprovedRunRuntimePath } from './run.js'

export type TemporalRuntimePreference = 'auto' | 'force-on' | 'force-off'

export function parseTemporalRuntimePreference(
  value: string | boolean | undefined,
): TemporalRuntimePreference {
  if (value === true || value === 'true') {
    return 'force-on'
  }

  if (value === false || value === 'false') {
    return 'force-off'
  }

  return 'auto'
}

export function resolveApprovedRunRuntime(input: {
  preference: TemporalRuntimePreference
  temporalEnabled: boolean
  defaultPath?: ApprovedRunRuntimePath
}): ApprovedRunRuntimePath {
  if (input.preference === 'force-on') {
    return 'temporal'
  }

  if (input.preference === 'force-off') {
    return 'direct'
  }

  if (input.defaultPath) {
    return input.defaultPath
  }

  return input.temporalEnabled ? 'temporal' : 'direct'
}

export function usesTemporalApprovedRunRuntime(
  resolvedPath: ApprovedRunRuntimePath,
) {
  return resolvedPath === 'temporal'
}
