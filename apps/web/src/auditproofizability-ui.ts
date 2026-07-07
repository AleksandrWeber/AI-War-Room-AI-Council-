import {
  auditproofizabilityAdminActionResponseSchema,
  auditproofizabilityAdminSummaryResponseSchema,
  auditproofizabilityCapabilitiesResponseSchema,
  auditproofizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAuditproofizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/auditproofizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return auditproofizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAuditproofizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/auditproofizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return auditproofizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAuditproofizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_auditproofizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/auditproofizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return auditproofizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAuditproofizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAuditproofizabilityRolloutCheckStatus(
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

export function formatAuditproofizabilityAdminAction(action: 'refresh_auditproofizability_summary') {
  switch (action) {
    case 'refresh_auditproofizability_summary':
      return 'Refresh auditproofizability summary'
  }
}

export function formatAuditproofizabilityDomain(
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

export async function fetchAuditproofizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/auditproofizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return auditproofizabilityCapabilitiesResponseSchema.parse(await response.json())
}
