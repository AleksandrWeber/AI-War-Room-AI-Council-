import {
  communicabilityAdminActionResponseSchema,
  communicabilityAdminSummaryResponseSchema,
  communicabilityCapabilitiesResponseSchema,
  communicabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCommunicabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/communicability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return communicabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCommunicabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/communicability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return communicabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCommunicabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_communicability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/communicability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return communicabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCommunicabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCommunicabilityRolloutCheckStatus(
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

export function formatCommunicabilityAdminAction(action: 'refresh_communicability_summary') {
  switch (action) {
    case 'refresh_communicability_summary':
      return 'Refresh communicability summary'
  }
}

export function formatCommunicabilityDomain(
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

export async function fetchCommunicabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/communicability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return communicabilityCapabilitiesResponseSchema.parse(await response.json())
}
