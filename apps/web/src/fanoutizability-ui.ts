import {
  fanoutizabilityAdminActionResponseSchema,
  fanoutizabilityAdminSummaryResponseSchema,
  fanoutizabilityCapabilitiesResponseSchema,
  fanoutizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchFanoutizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/fanoutizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return fanoutizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchFanoutizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/fanoutizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return fanoutizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeFanoutizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_fanoutizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/fanoutizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return fanoutizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatFanoutizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatFanoutizabilityRolloutCheckStatus(
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

export function formatFanoutizabilityAdminAction(action: 'refresh_fanoutizability_summary') {
  switch (action) {
    case 'refresh_fanoutizability_summary':
      return 'Refresh fanoutizability summary'
  }
}

export function formatFanoutizabilityDomain(
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

export async function fetchFanoutizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/fanoutizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return fanoutizabilityCapabilitiesResponseSchema.parse(await response.json())
}
