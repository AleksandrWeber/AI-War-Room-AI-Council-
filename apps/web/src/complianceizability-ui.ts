import {
  complianceizabilityAdminActionResponseSchema,
  complianceizabilityAdminSummaryResponseSchema,
  complianceizabilityCapabilitiesResponseSchema,
  complianceizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchComplianceizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/complianceizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return complianceizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchComplianceizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/complianceizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return complianceizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeComplianceizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_complianceizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/complianceizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return complianceizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatComplianceizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatComplianceizabilityRolloutCheckStatus(
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

export function formatComplianceizabilityAdminAction(action: 'refresh_complianceizability_summary') {
  switch (action) {
    case 'refresh_complianceizability_summary':
      return 'Refresh complianceizability summary'
  }
}

export function formatComplianceizabilityDomain(
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

export async function fetchComplianceizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/complianceizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return complianceizabilityCapabilitiesResponseSchema.parse(await response.json())
}
