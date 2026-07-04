import {
  authCapabilitiesResponseSchema,
  authRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAuthRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/auth/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return authRolloutResponseSchema.parse(await response.json())
}

export function formatAuthRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAuthRolloutCheckStatus(
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

export async function fetchAuthCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/auth/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return authCapabilitiesResponseSchema.parse(await response.json())
}
