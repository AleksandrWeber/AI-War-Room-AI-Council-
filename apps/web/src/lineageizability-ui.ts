import {
  lineageizabilityAdminActionResponseSchema,
  lineageizabilityAdminSummaryResponseSchema,
  lineageizabilityCapabilitiesResponseSchema,
  lineageizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchLineageizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/lineageizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return lineageizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchLineageizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/lineageizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return lineageizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeLineageizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_lineageizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/lineageizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return lineageizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatLineageizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatLineageizabilityRolloutCheckStatus(
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

export function formatLineageizabilityAdminAction(action: 'refresh_lineageizability_summary') {
  switch (action) {
    case 'refresh_lineageizability_summary':
      return 'Refresh lineageizability summary'
  }
}

export function formatLineageizabilityDomain(
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

export async function fetchLineageizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/lineageizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return lineageizabilityCapabilitiesResponseSchema.parse(await response.json())
}
