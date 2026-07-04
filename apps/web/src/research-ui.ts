import {
  researchCapabilitiesResponseSchema,
  researchRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchResearchCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/research/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return researchCapabilitiesResponseSchema.parse(await response.json())
}

export async function fetchResearchRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/research/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return researchRolloutResponseSchema.parse(await response.json())
}

export function formatResearchRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatResearchRolloutCheckStatus(
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
