import {
  robustizabilityAdminActionResponseSchema,
  robustizabilityAdminSummaryResponseSchema,
  robustizabilityCapabilitiesResponseSchema,
  robustizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRobustizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/robustizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return robustizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRobustizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/robustizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return robustizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRobustizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_robustizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/robustizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return robustizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRobustizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRobustizabilityRolloutCheckStatus(
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

export function formatRobustizabilityAdminAction(action: 'refresh_robustizability_summary') {
  switch (action) {
    case 'refresh_robustizability_summary':
      return 'Refresh robustizability summary'
  }
}

export function formatRobustizabilityDomain(
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

export async function fetchRobustizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/robustizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return robustizabilityCapabilitiesResponseSchema.parse(await response.json())
}
