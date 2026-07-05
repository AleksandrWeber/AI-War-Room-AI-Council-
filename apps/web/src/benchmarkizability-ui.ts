import {
  benchmarkizabilityAdminActionResponseSchema,
  benchmarkizabilityAdminSummaryResponseSchema,
  benchmarkizabilityCapabilitiesResponseSchema,
  benchmarkizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchBenchmarkizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/benchmarkizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return benchmarkizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchBenchmarkizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/benchmarkizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return benchmarkizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeBenchmarkizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_benchmarkizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/benchmarkizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return benchmarkizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatBenchmarkizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatBenchmarkizabilityRolloutCheckStatus(
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

export function formatBenchmarkizabilityAdminAction(action: 'refresh_benchmarkizability_summary') {
  switch (action) {
    case 'refresh_benchmarkizability_summary':
      return 'Refresh benchmarkizability summary'
  }
}

export function formatBenchmarkizabilityDomain(
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

export async function fetchBenchmarkizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/benchmarkizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return benchmarkizabilityCapabilitiesResponseSchema.parse(await response.json())
}
