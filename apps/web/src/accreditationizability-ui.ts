import {
  accreditationizabilityAdminActionResponseSchema,
  accreditationizabilityAdminSummaryResponseSchema,
  accreditationizabilityCapabilitiesResponseSchema,
  accreditationizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAccreditationizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/accreditationizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return accreditationizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAccreditationizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/accreditationizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return accreditationizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAccreditationizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_accreditationizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/accreditationizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return accreditationizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAccreditationizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAccreditationizabilityRolloutCheckStatus(
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

export function formatAccreditationizabilityAdminAction(action: 'refresh_accreditationizability_summary') {
  switch (action) {
    case 'refresh_accreditationizability_summary':
      return 'Refresh accreditationizability summary'
  }
}

export function formatAccreditationizabilityDomain(
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

export async function fetchAccreditationizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/accreditationizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return accreditationizabilityCapabilitiesResponseSchema.parse(await response.json())
}
