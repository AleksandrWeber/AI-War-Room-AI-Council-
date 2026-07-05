import {
  canaryizabilityAdminActionResponseSchema,
  canaryizabilityAdminSummaryResponseSchema,
  canaryizabilityCapabilitiesResponseSchema,
  canaryizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCanaryizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/canaryizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return canaryizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCanaryizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/canaryizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return canaryizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCanaryizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_canaryizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/canaryizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return canaryizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCanaryizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCanaryizabilityRolloutCheckStatus(
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

export function formatCanaryizabilityAdminAction(action: 'refresh_canaryizability_summary') {
  switch (action) {
    case 'refresh_canaryizability_summary':
      return 'Refresh canaryizability summary'
  }
}

export function formatCanaryizabilityDomain(
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

export async function fetchCanaryizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/canaryizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return canaryizabilityCapabilitiesResponseSchema.parse(await response.json())
}
