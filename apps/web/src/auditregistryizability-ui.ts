import {
  auditregistryizabilityAdminActionResponseSchema,
  auditregistryizabilityAdminSummaryResponseSchema,
  auditregistryizabilityCapabilitiesResponseSchema,
  auditregistryizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAuditregistryizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/auditregistryizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return auditregistryizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAuditregistryizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/auditregistryizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return auditregistryizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAuditregistryizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_auditregistryizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/auditregistryizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return auditregistryizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAuditregistryizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAuditregistryizabilityRolloutCheckStatus(
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

export function formatAuditregistryizabilityAdminAction(action: 'refresh_auditregistryizability_summary') {
  switch (action) {
    case 'refresh_auditregistryizability_summary':
      return 'Refresh auditregistryizability summary'
  }
}

export function formatAuditregistryizabilityDomain(
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

export async function fetchAuditregistryizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/auditregistryizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return auditregistryizabilityCapabilitiesResponseSchema.parse(await response.json())
}
