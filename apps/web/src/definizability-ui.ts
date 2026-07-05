import {
  definizabilityAdminActionResponseSchema,
  definizabilityAdminSummaryResponseSchema,
  definizabilityCapabilitiesResponseSchema,
  definizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDefinizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/definizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return definizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDefinizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/definizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return definizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDefinizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_definizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/definizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return definizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDefinizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDefinizabilityRolloutCheckStatus(
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

export function formatDefinizabilityAdminAction(action: 'refresh_definizability_summary') {
  switch (action) {
    case 'refresh_definizability_summary':
      return 'Refresh definizability summary'
  }
}

export function formatDefinizabilityDomain(
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

export async function fetchDefinizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/definizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return definizabilityCapabilitiesResponseSchema.parse(await response.json())
}
