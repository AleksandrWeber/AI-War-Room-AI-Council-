import {
  governanceAdminActionResponseSchema,
  governanceAdminSummaryResponseSchema,
  governanceCapabilitiesResponseSchema,
  governanceRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchGovernanceRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/governance/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return governanceRolloutResponseSchema.parse(await response.json())
}

export async function fetchGovernanceAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/governance/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return governanceAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeGovernanceAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_governance_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/governance/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return governanceAdminActionResponseSchema.parse(await response.json())
}

export function formatGovernanceRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatGovernanceRolloutCheckStatus(
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

export function formatGovernanceAdminAction(
  action: 'refresh_governance_summary',
) {
  switch (action) {
    case 'refresh_governance_summary':
      return 'Refresh governance summary'
  }
}

export function formatGovernanceDomain(
  domain:
    | 'workspace_memberships'
    | 'provider_credentials'
    | 'shield_reviews'
    | 'billing_records',
) {
  switch (domain) {
    case 'workspace_memberships':
      return 'Workspace memberships'
    case 'provider_credentials':
      return 'Provider credentials'
    case 'shield_reviews':
      return 'Shield reviews'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchGovernanceCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/governance/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return governanceCapabilitiesResponseSchema.parse(await response.json())
}
