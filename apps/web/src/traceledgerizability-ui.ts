import {
  traceledgerizabilityAdminActionResponseSchema,
  traceledgerizabilityAdminSummaryResponseSchema,
  traceledgerizabilityCapabilitiesResponseSchema,
  traceledgerizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTraceledgerizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/traceledgerizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return traceledgerizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchTraceledgerizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/traceledgerizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return traceledgerizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTraceledgerizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_traceledgerizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/traceledgerizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return traceledgerizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatTraceledgerizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTraceledgerizabilityRolloutCheckStatus(
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

export function formatTraceledgerizabilityAdminAction(action: 'refresh_traceledgerizability_summary') {
  switch (action) {
    case 'refresh_traceledgerizability_summary':
      return 'Refresh traceledgerizability summary'
  }
}

export function formatTraceledgerizabilityDomain(
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

export async function fetchTraceledgerizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/traceledgerizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return traceledgerizabilityCapabilitiesResponseSchema.parse(await response.json())
}
