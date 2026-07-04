import {
  temporalCapabilitiesResponseSchema,
  temporalRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTemporalCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/runs/temporal/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return temporalCapabilitiesResponseSchema.parse(await response.json())
}

export async function fetchTemporalRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/runs/temporal/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return temporalRolloutResponseSchema.parse(await response.json())
}

export function formatTemporalRolloutStatus(
  status: 'ready' | 'not_ready' | 'disabled',
) {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
    case 'disabled':
      return 'Disabled'
  }
}

export function formatTemporalRolloutCheckStatus(
  status: 'pass' | 'fail' | 'skip',
) {
  switch (status) {
    case 'pass':
      return 'Pass'
    case 'fail':
      return 'Fail'
    case 'skip':
      return 'Skip'
  }
}
