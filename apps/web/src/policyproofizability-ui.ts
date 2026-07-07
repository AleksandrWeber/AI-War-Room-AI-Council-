import {
  policyproofizabilityAdminActionResponseSchema,
  policyproofizabilityAdminSummaryResponseSchema,
  policyproofizabilityCapabilitiesResponseSchema,
  policyproofizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchPolicyproofizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/policyproofizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return policyproofizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchPolicyproofizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/policyproofizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return policyproofizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executePolicyproofizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_policyproofizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/policyproofizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return policyproofizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatPolicyproofizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatPolicyproofizabilityRolloutCheckStatus(
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

export function formatPolicyproofizabilityAdminAction(action: 'refresh_policyproofizability_summary') {
  switch (action) {
    case 'refresh_policyproofizability_summary':
      return 'Refresh policyproofizability summary'
  }
}

export function formatPolicyproofizabilityDomain(
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

export async function fetchPolicyproofizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/policyproofizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return policyproofizabilityCapabilitiesResponseSchema.parse(await response.json())
}
