import {
  metricizabilityAdminActionResponseSchema,
  metricizabilityAdminSummaryResponseSchema,
  metricizabilityCapabilitiesResponseSchema,
  metricizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchMetricizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/metricizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return metricizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchMetricizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/metricizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return metricizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeMetricizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_metricizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/metricizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return metricizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatMetricizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatMetricizabilityRolloutCheckStatus(
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

export function formatMetricizabilityAdminAction(action: 'refresh_metricizability_summary') {
  switch (action) {
    case 'refresh_metricizability_summary':
      return 'Refresh metricizability summary'
  }
}

export function formatMetricizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'idempotency_keys' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'idempotency_keys':
      return 'Idempotency keys'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchMetricizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/metricizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return metricizabilityCapabilitiesResponseSchema.parse(await response.json())
}
