import {
  collectizabilityAdminActionResponseSchema,
  collectizabilityAdminSummaryResponseSchema,
  collectizabilityCapabilitiesResponseSchema,
  collectizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCollectizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/collectizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return collectizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCollectizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/collectizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return collectizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCollectizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_collectizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/collectizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return collectizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCollectizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCollectizabilityRolloutCheckStatus(
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

export function formatCollectizabilityAdminAction(action: 'refresh_collectizability_summary') {
  switch (action) {
    case 'refresh_collectizability_summary':
      return 'Refresh collectizability summary'
  }
}

export function formatCollectizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_usage_limits' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_usage_limits':
      return 'Workspace usage limits'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchCollectizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/collectizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return collectizabilityCapabilitiesResponseSchema.parse(await response.json())
}
