import {
  auditTrailAdminActionResponseSchema,
  auditTrailAdminSummaryResponseSchema,
  auditTrailCapabilitiesResponseSchema,
  auditTrailRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAuditTrailRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/audit/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return auditTrailRolloutResponseSchema.parse(await response.json())
}

export async function fetchAuditAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/audit/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return auditTrailAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAuditAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_audit_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/audit/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return auditTrailAdminActionResponseSchema.parse(await response.json())
}

export function formatAuditTrailRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAuditTrailRolloutCheckStatus(
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

export function formatAuditAdminAction(action: 'refresh_audit_summary') {
  switch (action) {
    case 'refresh_audit_summary':
      return 'Refresh audit summary'
  }
}

export function formatAuditDomain(
  domain:
    | 'usage_events'
    | 'billing_webhook_events'
    | 'billing_notifications'
    | 'meter_usage_reports',
) {
  switch (domain) {
    case 'usage_events':
      return 'Usage events'
    case 'billing_webhook_events':
      return 'Billing webhook events'
    case 'billing_notifications':
      return 'Billing notifications'
    case 'meter_usage_reports':
      return 'Meter usage reports'
  }
}

export async function fetchAuditTrailCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/audit/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return auditTrailCapabilitiesResponseSchema.parse(await response.json())
}
