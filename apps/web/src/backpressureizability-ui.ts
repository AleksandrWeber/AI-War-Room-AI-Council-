import {
  backpressureizabilityAdminActionResponseSchema,
  backpressureizabilityAdminSummaryResponseSchema,
  backpressureizabilityCapabilitiesResponseSchema,
  backpressureizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchBackpressureizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/backpressureizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return backpressureizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchBackpressureizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/backpressureizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return backpressureizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeBackpressureizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_backpressureizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/backpressureizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return backpressureizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatBackpressureizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatBackpressureizabilityRolloutCheckStatus(
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

export function formatBackpressureizabilityAdminAction(action: 'refresh_backpressureizability_summary') {
  switch (action) {
    case 'refresh_backpressureizability_summary':
      return 'Refresh backpressureizability summary'
  }
}

export function formatBackpressureizabilityDomain(
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

export async function fetchBackpressureizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/backpressureizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return backpressureizabilityCapabilitiesResponseSchema.parse(await response.json())
}
