import {
  schedulingizabilityAdminActionResponseSchema,
  schedulingizabilityAdminSummaryResponseSchema,
  schedulingizabilityCapabilitiesResponseSchema,
  schedulingizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSchedulingizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/schedulingizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return schedulingizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSchedulingizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/schedulingizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return schedulingizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSchedulingizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_schedulingizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/schedulingizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return schedulingizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSchedulingizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSchedulingizabilityRolloutCheckStatus(
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

export function formatSchedulingizabilityAdminAction(action: 'refresh_schedulingizability_summary') {
  switch (action) {
    case 'refresh_schedulingizability_summary':
      return 'Refresh schedulingizability summary'
  }
}

export function formatSchedulingizabilityDomain(
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

export async function fetchSchedulingizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/schedulingizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return schedulingizabilityCapabilitiesResponseSchema.parse(await response.json())
}
