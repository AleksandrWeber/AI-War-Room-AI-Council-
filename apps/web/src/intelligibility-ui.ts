import {
  intelligibilityAdminActionResponseSchema,
  intelligibilityAdminSummaryResponseSchema,
  intelligibilityCapabilitiesResponseSchema,
  intelligibilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchIntelligibilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/intelligibility/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return intelligibilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchIntelligibilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/intelligibility/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return intelligibilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeIntelligibilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_intelligibility_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/intelligibility/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return intelligibilityAdminActionResponseSchema.parse(await response.json())
}

export function formatIntelligibilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatIntelligibilityRolloutCheckStatus(
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

export function formatIntelligibilityAdminAction(action: 'refresh_intelligibility_summary') {
  switch (action) {
    case 'refresh_intelligibility_summary':
      return 'Refresh intelligibility summary'
  }
}

export function formatIntelligibilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'moderator_syntheses' | 'agent_outputs',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'moderator_syntheses':
      return 'Moderator syntheses'
    case 'agent_outputs':
      return 'Agent outputs'
  }
}

export async function fetchIntelligibilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/intelligibility/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return intelligibilityCapabilitiesResponseSchema.parse(await response.json())
}
