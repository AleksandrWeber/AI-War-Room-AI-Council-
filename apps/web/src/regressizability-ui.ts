import {
  regressizabilityAdminActionResponseSchema,
  regressizabilityAdminSummaryResponseSchema,
  regressizabilityCapabilitiesResponseSchema,
  regressizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRegressizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/regressizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return regressizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRegressizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/regressizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return regressizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRegressizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_regressizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/regressizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return regressizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRegressizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRegressizabilityRolloutCheckStatus(
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

export function formatRegressizabilityAdminAction(action: 'refresh_regressizability_summary') {
  switch (action) {
    case 'refresh_regressizability_summary':
      return 'Refresh regressizability summary'
  }
}

export function formatRegressizabilityDomain(
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

export async function fetchRegressizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/regressizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return regressizabilityCapabilitiesResponseSchema.parse(await response.json())
}
