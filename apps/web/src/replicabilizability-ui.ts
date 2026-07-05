import {
  replicabilizabilityAdminActionResponseSchema,
  replicabilizabilityAdminSummaryResponseSchema,
  replicabilizabilityCapabilitiesResponseSchema,
  replicabilizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchReplicabilizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/replicabilizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return replicabilizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchReplicabilizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/replicabilizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return replicabilizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeReplicabilizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_replicabilizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/replicabilizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return replicabilizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatReplicabilizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatReplicabilizabilityRolloutCheckStatus(
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

export function formatReplicabilizabilityAdminAction(action: 'refresh_replicabilizability_summary') {
  switch (action) {
    case 'refresh_replicabilizability_summary':
      return 'Refresh replicabilizability summary'
  }
}

export function formatReplicabilizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_meter_usage_reports' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_meter_usage_reports':
      return 'Meter usage reports'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchReplicabilizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/replicabilizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return replicabilizabilityCapabilitiesResponseSchema.parse(await response.json())
}
