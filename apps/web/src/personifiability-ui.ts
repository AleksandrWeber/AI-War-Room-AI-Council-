import {
  personifiabilityAdminActionResponseSchema,
  personifiabilityAdminSummaryResponseSchema,
  personifiabilityCapabilitiesResponseSchema,
  personifiabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchPersonifiabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/personifiability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return personifiabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchPersonifiabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/personifiability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return personifiabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executePersonifiabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_personifiability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/personifiability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return personifiabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatPersonifiabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatPersonifiabilityRolloutCheckStatus(
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

export function formatPersonifiabilityAdminAction(action: 'refresh_personifiability_summary') {
  switch (action) {
    case 'refresh_personifiability_summary':
      return 'Refresh personifiability summary'
  }
}

export function formatPersonifiabilityDomain(
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

export async function fetchPersonifiabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/personifiability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return personifiabilityCapabilitiesResponseSchema.parse(await response.json())
}
