import {
  traceproofizabilityAdminActionResponseSchema,
  traceproofizabilityAdminSummaryResponseSchema,
  traceproofizabilityCapabilitiesResponseSchema,
  traceproofizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTraceproofizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/traceproofizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return traceproofizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchTraceproofizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/traceproofizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return traceproofizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTraceproofizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_traceproofizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/traceproofizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return traceproofizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatTraceproofizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTraceproofizabilityRolloutCheckStatus(
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

export function formatTraceproofizabilityAdminAction(action: 'refresh_traceproofizability_summary') {
  switch (action) {
    case 'refresh_traceproofizability_summary':
      return 'Refresh traceproofizability summary'
  }
}

export function formatTraceproofizabilityDomain(
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

export async function fetchTraceproofizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/traceproofizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return traceproofizabilityCapabilitiesResponseSchema.parse(await response.json())
}
