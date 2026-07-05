import {
  analogizabilityAdminActionResponseSchema,
  analogizabilityAdminSummaryResponseSchema,
  analogizabilityCapabilitiesResponseSchema,
  analogizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAnalogizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/analogizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return analogizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAnalogizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/analogizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return analogizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAnalogizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_analogizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/analogizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return analogizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAnalogizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAnalogizabilityRolloutCheckStatus(
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

export function formatAnalogizabilityAdminAction(action: 'refresh_analogizability_summary') {
  switch (action) {
    case 'refresh_analogizability_summary':
      return 'Refresh analogizability summary'
  }
}

export function formatAnalogizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'usage_events' | 'billing_meter_usage_reports',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'usage_events':
      return 'Usage events'
    case 'billing_meter_usage_reports':
      return 'Meter usage reports'
  }
}

export async function fetchAnalogizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/analogizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return analogizabilityCapabilitiesResponseSchema.parse(await response.json())
}
