import {
  filterizabilityAdminActionResponseSchema,
  filterizabilityAdminSummaryResponseSchema,
  filterizabilityCapabilitiesResponseSchema,
  filterizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchFilterizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/filterizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return filterizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchFilterizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/filterizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return filterizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeFilterizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_filterizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/filterizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return filterizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatFilterizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatFilterizabilityRolloutCheckStatus(
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

export function formatFilterizabilityAdminAction(action: 'refresh_filterizability_summary') {
  switch (action) {
    case 'refresh_filterizability_summary':
      return 'Refresh filterizability summary'
  }
}

export function formatFilterizabilityDomain(
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

export async function fetchFilterizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/filterizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return filterizabilityCapabilitiesResponseSchema.parse(await response.json())
}
