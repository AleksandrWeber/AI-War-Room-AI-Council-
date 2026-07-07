import {
  compliancechainizabilityAdminActionResponseSchema,
  compliancechainizabilityAdminSummaryResponseSchema,
  compliancechainizabilityCapabilitiesResponseSchema,
  compliancechainizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCompliancechainizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/compliancechainizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return compliancechainizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCompliancechainizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/compliancechainizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return compliancechainizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCompliancechainizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_compliancechainizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/compliancechainizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return compliancechainizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCompliancechainizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCompliancechainizabilityRolloutCheckStatus(
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

export function formatCompliancechainizabilityAdminAction(action: 'refresh_compliancechainizability_summary') {
  switch (action) {
    case 'refresh_compliancechainizability_summary':
      return 'Refresh compliancechainizability summary'
  }
}

export function formatCompliancechainizabilityDomain(
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

export async function fetchCompliancechainizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/compliancechainizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return compliancechainizabilityCapabilitiesResponseSchema.parse(await response.json())
}
