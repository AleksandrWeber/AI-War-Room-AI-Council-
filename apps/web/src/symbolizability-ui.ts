import {
  symbolizabilityAdminActionResponseSchema,
  symbolizabilityAdminSummaryResponseSchema,
  symbolizabilityCapabilitiesResponseSchema,
  symbolizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSymbolizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/symbolizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return symbolizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSymbolizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/symbolizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return symbolizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSymbolizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_symbolizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/symbolizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return symbolizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSymbolizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSymbolizabilityRolloutCheckStatus(
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

export function formatSymbolizabilityAdminAction(action: 'refresh_symbolizability_summary') {
  switch (action) {
    case 'refresh_symbolizability_summary':
      return 'Refresh symbolizability summary'
  }
}

export function formatSymbolizabilityDomain(
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

export async function fetchSymbolizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/symbolizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return symbolizabilityCapabilitiesResponseSchema.parse(await response.json())
}
