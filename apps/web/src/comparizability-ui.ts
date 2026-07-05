import {
  comparizabilityAdminActionResponseSchema,
  comparizabilityAdminSummaryResponseSchema,
  comparizabilityCapabilitiesResponseSchema,
  comparizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchComparizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/comparizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return comparizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchComparizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/comparizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return comparizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeComparizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_comparizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/comparizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return comparizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatComparizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatComparizabilityRolloutCheckStatus(
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

export function formatComparizabilityAdminAction(action: 'refresh_comparizability_summary') {
  switch (action) {
    case 'refresh_comparizability_summary':
      return 'Refresh comparizability summary'
  }
}

export function formatComparizabilityDomain(
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

export async function fetchComparizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/comparizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return comparizabilityCapabilitiesResponseSchema.parse(await response.json())
}
