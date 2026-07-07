import {
  auditlineizabilityAdminActionResponseSchema,
  auditlineizabilityAdminSummaryResponseSchema,
  auditlineizabilityCapabilitiesResponseSchema,
  auditlineizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAuditlineizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/auditlineizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return auditlineizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAuditlineizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/auditlineizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return auditlineizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAuditlineizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_auditlineizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/auditlineizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return auditlineizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAuditlineizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAuditlineizabilityRolloutCheckStatus(
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

export function formatAuditlineizabilityAdminAction(action: 'refresh_auditlineizability_summary') {
  switch (action) {
    case 'refresh_auditlineizability_summary':
      return 'Refresh auditlineizability summary'
  }
}

export function formatAuditlineizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_invoices' | 'billing_records',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_invoices':
      return 'Billing invoices'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchAuditlineizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/auditlineizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return auditlineizabilityCapabilitiesResponseSchema.parse(await response.json())
}
