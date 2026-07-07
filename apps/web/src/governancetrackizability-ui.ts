import {
  governancetrackizabilityAdminActionResponseSchema,
  governancetrackizabilityAdminSummaryResponseSchema,
  governancetrackizabilityCapabilitiesResponseSchema,
  governancetrackizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchGovernancetrackizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/governancetrackizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return governancetrackizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchGovernancetrackizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/governancetrackizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return governancetrackizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeGovernancetrackizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_governancetrackizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/governancetrackizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return governancetrackizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatGovernancetrackizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatGovernancetrackizabilityRolloutCheckStatus(
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

export function formatGovernancetrackizabilityAdminAction(action: 'refresh_governancetrackizability_summary') {
  switch (action) {
    case 'refresh_governancetrackizability_summary':
      return 'Refresh governancetrackizability summary'
  }
}

export function formatGovernancetrackizabilityDomain(
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

export async function fetchGovernancetrackizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/governancetrackizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return governancetrackizabilityCapabilitiesResponseSchema.parse(await response.json())
}
