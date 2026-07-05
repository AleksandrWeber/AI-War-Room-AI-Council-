import {
  retrodictizabilityAdminActionResponseSchema,
  retrodictizabilityAdminSummaryResponseSchema,
  retrodictizabilityCapabilitiesResponseSchema,
  retrodictizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRetrodictizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/retrodictizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return retrodictizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRetrodictizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/retrodictizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return retrodictizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRetrodictizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_retrodictizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/retrodictizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return retrodictizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRetrodictizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRetrodictizabilityRolloutCheckStatus(
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

export function formatRetrodictizabilityAdminAction(action: 'refresh_retrodictizability_summary') {
  switch (action) {
    case 'refresh_retrodictizability_summary':
      return 'Refresh retrodictizability summary'
  }
}

export function formatRetrodictizabilityDomain(
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

export async function fetchRetrodictizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/retrodictizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return retrodictizabilityCapabilitiesResponseSchema.parse(await response.json())
}
