import {
  effectivenessAdminActionResponseSchema,
  effectivenessAdminSummaryResponseSchema,
  effectivenessCapabilitiesResponseSchema,
  effectivenessRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchEffectivenessRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/effectiveness/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return effectivenessRolloutResponseSchema.parse(await response.json())
}

export async function fetchEffectivenessAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/effectiveness/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return effectivenessAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeEffectivenessAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_effectiveness_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/effectiveness/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceId,
        ...input,
      }),
    },
  )

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return effectivenessAdminActionResponseSchema.parse(await response.json())
}

export function formatEffectivenessRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatEffectivenessRolloutCheckStatus(
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

export function formatEffectivenessAdminAction(action: 'refresh_effectiveness_summary') {
  switch (action) {
    case 'refresh_effectiveness_summary':
      return 'Refresh effectiveness summary'
  }
}

export function formatEffectivenessDomain(
  domain: 'completed_runs' | 'failed_runs' | 'agent_outputs' | 'moderator_syntheses',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'agent_outputs':
      return 'Agent outputs'
    case 'moderator_syntheses':
      return 'Moderator syntheses'
  }
}

export async function fetchEffectivenessCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/effectiveness/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return effectivenessCapabilitiesResponseSchema.parse(await response.json())
}
