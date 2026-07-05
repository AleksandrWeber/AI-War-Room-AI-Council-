import {
  stylizabilityAdminActionResponseSchema,
  stylizabilityAdminSummaryResponseSchema,
  stylizabilityCapabilitiesResponseSchema,
  stylizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchStylizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/stylizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return stylizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchStylizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/stylizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return stylizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeStylizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_stylizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/stylizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return stylizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatStylizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatStylizabilityRolloutCheckStatus(
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

export function formatStylizabilityAdminAction(action: 'refresh_stylizability_summary') {
  switch (action) {
    case 'refresh_stylizability_summary':
      return 'Refresh stylizability summary'
  }
}

export function formatStylizabilityDomain(
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

export async function fetchStylizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/stylizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return stylizabilityCapabilitiesResponseSchema.parse(await response.json())
}
