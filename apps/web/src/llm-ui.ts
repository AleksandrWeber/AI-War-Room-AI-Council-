import {
  llmCapabilitiesResponseSchema,
  llmRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchLlmCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/llm/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return llmCapabilitiesResponseSchema.parse(await response.json())
}

export async function fetchLlmRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/llm/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return llmRolloutResponseSchema.parse(await response.json())
}

export function formatLlmRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatLlmRolloutCheckStatus(
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
