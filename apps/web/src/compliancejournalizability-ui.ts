import {
  compliancejournalizabilityAdminActionResponseSchema,
  compliancejournalizabilityAdminSummaryResponseSchema,
  compliancejournalizabilityCapabilitiesResponseSchema,
  compliancejournalizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCompliancejournalizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/compliancejournalizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return compliancejournalizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCompliancejournalizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/compliancejournalizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return compliancejournalizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCompliancejournalizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_compliancejournalizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/compliancejournalizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return compliancejournalizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCompliancejournalizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCompliancejournalizabilityRolloutCheckStatus(
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

export function formatCompliancejournalizabilityAdminAction(action: 'refresh_compliancejournalizability_summary') {
  switch (action) {
    case 'refresh_compliancejournalizability_summary':
      return 'Refresh compliancejournalizability summary'
  }
}

export function formatCompliancejournalizabilityDomain(
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

export async function fetchCompliancejournalizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/compliancejournalizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return compliancejournalizabilityCapabilitiesResponseSchema.parse(await response.json())
}
