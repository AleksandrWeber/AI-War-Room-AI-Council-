import {
  nonrepudiationizabilityAdminActionResponseSchema,
  nonrepudiationizabilityAdminSummaryResponseSchema,
  nonrepudiationizabilityCapabilitiesResponseSchema,
  nonrepudiationizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchNonrepudiationizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/nonrepudiationizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return nonrepudiationizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchNonrepudiationizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/nonrepudiationizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return nonrepudiationizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeNonrepudiationizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_nonrepudiationizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/nonrepudiationizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return nonrepudiationizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatNonrepudiationizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatNonrepudiationizabilityRolloutCheckStatus(
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

export function formatNonrepudiationizabilityAdminAction(action: 'refresh_nonrepudiationizability_summary') {
  switch (action) {
    case 'refresh_nonrepudiationizability_summary':
      return 'Refresh nonrepudiationizability summary'
  }
}

export function formatNonrepudiationizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_memberships' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_memberships':
      return 'Workspace memberships'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchNonrepudiationizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/nonrepudiationizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return nonrepudiationizabilityCapabilitiesResponseSchema.parse(await response.json())
}
