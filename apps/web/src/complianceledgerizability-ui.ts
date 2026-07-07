import {
  complianceledgerizabilityAdminActionResponseSchema,
  complianceledgerizabilityAdminSummaryResponseSchema,
  complianceledgerizabilityCapabilitiesResponseSchema,
  complianceledgerizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchComplianceledgerizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/complianceledgerizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return complianceledgerizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchComplianceledgerizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/complianceledgerizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return complianceledgerizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeComplianceledgerizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_complianceledgerizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/complianceledgerizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return complianceledgerizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatComplianceledgerizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatComplianceledgerizabilityRolloutCheckStatus(
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

export function formatComplianceledgerizabilityAdminAction(action: 'refresh_complianceledgerizability_summary') {
  switch (action) {
    case 'refresh_complianceledgerizability_summary':
      return 'Refresh complianceledgerizability summary'
  }
}

export function formatComplianceledgerizabilityDomain(
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

export async function fetchComplianceledgerizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/complianceledgerizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return complianceledgerizabilityCapabilitiesResponseSchema.parse(await response.json())
}
