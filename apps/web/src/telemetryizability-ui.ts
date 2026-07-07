import {
  telemetryizabilityAdminActionResponseSchema,
  telemetryizabilityAdminSummaryResponseSchema,
  telemetryizabilityCapabilitiesResponseSchema,
  telemetryizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTelemetryizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/telemetryizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return telemetryizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchTelemetryizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/telemetryizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return telemetryizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTelemetryizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_telemetryizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/telemetryizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return telemetryizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatTelemetryizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTelemetryizabilityRolloutCheckStatus(
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

export function formatTelemetryizabilityAdminAction(action: 'refresh_telemetryizability_summary') {
  switch (action) {
    case 'refresh_telemetryizability_summary':
      return 'Refresh telemetryizability summary'
  }
}

export function formatTelemetryizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_notifications' | 'billing_webhook_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_notifications':
      return 'Billing notifications'
    case 'billing_webhook_events':
      return 'Billing webhook events'
  }
}

export async function fetchTelemetryizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/telemetryizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return telemetryizabilityCapabilitiesResponseSchema.parse(await response.json())
}
