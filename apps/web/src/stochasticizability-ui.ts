import {
  stochasticizabilityAdminActionResponseSchema,
  stochasticizabilityAdminSummaryResponseSchema,
  stochasticizabilityCapabilitiesResponseSchema,
  stochasticizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchStochasticizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/stochasticizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return stochasticizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchStochasticizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/stochasticizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return stochasticizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeStochasticizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_stochasticizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/stochasticizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return stochasticizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatStochasticizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatStochasticizabilityRolloutCheckStatus(
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

export function formatStochasticizabilityAdminAction(action: 'refresh_stochasticizability_summary') {
  switch (action) {
    case 'refresh_stochasticizability_summary':
      return 'Refresh stochasticizability summary'
  }
}

export function formatStochasticizabilityDomain(
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

export async function fetchStochasticizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/stochasticizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return stochasticizabilityCapabilitiesResponseSchema.parse(await response.json())
}
