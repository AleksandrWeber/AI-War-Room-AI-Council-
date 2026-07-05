import {
  auditabilityAdminActionResponseSchema,
  auditabilityAdminSummaryResponseSchema,
  auditabilityCapabilitiesResponseSchema,
  auditabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAuditabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/auditability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return auditabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAuditabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/auditability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return auditabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAuditabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_auditability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/auditability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return auditabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAuditabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAuditabilityRolloutCheckStatus(
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

export function formatAuditabilityAdminAction(action: 'refresh_auditability_summary') {
  switch (action) {
    case 'refresh_auditability_summary':
      return 'Refresh auditability summary'
  }
}

export function formatAuditabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'usage_events' | 'billing_webhook_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'usage_events':
      return 'Usage events'
    case 'billing_webhook_events':
      return 'Billing webhook events'
  }
}

export async function fetchAuditabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/auditability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return auditabilityCapabilitiesResponseSchema.parse(await response.json())
}
