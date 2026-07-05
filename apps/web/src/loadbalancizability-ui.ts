import {
  loadbalancizabilityAdminActionResponseSchema,
  loadbalancizabilityAdminSummaryResponseSchema,
  loadbalancizabilityCapabilitiesResponseSchema,
  loadbalancizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchLoadbalancizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/loadbalancizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return loadbalancizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchLoadbalancizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/loadbalancizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return loadbalancizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeLoadbalancizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_loadbalancizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/loadbalancizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return loadbalancizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatLoadbalancizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatLoadbalancizabilityRolloutCheckStatus(
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

export function formatLoadbalancizabilityAdminAction(action: 'refresh_loadbalancizability_summary') {
  switch (action) {
    case 'refresh_loadbalancizability_summary':
      return 'Refresh loadbalancizability summary'
  }
}

export function formatLoadbalancizabilityDomain(
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

export async function fetchLoadbalancizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/loadbalancizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return loadbalancizabilityCapabilitiesResponseSchema.parse(await response.json())
}
