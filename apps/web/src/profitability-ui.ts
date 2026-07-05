import {
  profitabilityAdminActionResponseSchema,
  profitabilityAdminSummaryResponseSchema,
  profitabilityCapabilitiesResponseSchema,
  profitabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchProfitabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/profitability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return profitabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchProfitabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/profitability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return profitabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeProfitabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_profitability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/profitability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return profitabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatProfitabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatProfitabilityRolloutCheckStatus(
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

export function formatProfitabilityAdminAction(action: 'refresh_profitability_summary') {
  switch (action) {
    case 'refresh_profitability_summary':
      return 'Refresh profitability summary'
  }
}

export function formatProfitabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_records' | 'billing_invoices',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_records':
      return 'Billing records'
    case 'billing_invoices':
      return 'Billing invoices'
  }
}

export async function fetchProfitabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/profitability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return profitabilityCapabilitiesResponseSchema.parse(await response.json())
}
