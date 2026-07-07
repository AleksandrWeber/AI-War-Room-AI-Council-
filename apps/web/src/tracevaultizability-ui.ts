import {
  tracevaultizabilityAdminActionResponseSchema,
  tracevaultizabilityAdminSummaryResponseSchema,
  tracevaultizabilityCapabilitiesResponseSchema,
  tracevaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTracevaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/tracevaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return tracevaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchTracevaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/tracevaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return tracevaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTracevaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_tracevaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/tracevaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return tracevaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatTracevaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTracevaultizabilityRolloutCheckStatus(
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

export function formatTracevaultizabilityAdminAction(action: 'refresh_tracevaultizability_summary') {
  switch (action) {
    case 'refresh_tracevaultizability_summary':
      return 'Refresh tracevaultizability summary'
  }
}

export function formatTracevaultizabilityDomain(
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

export async function fetchTracevaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/tracevaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return tracevaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
