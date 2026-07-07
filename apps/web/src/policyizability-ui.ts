import {
  policyizabilityAdminActionResponseSchema,
  policyizabilityAdminSummaryResponseSchema,
  policyizabilityCapabilitiesResponseSchema,
  policyizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchPolicyizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/policyizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return policyizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchPolicyizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/policyizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return policyizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executePolicyizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_policyizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/policyizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return policyizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatPolicyizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatPolicyizabilityRolloutCheckStatus(
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

export function formatPolicyizabilityAdminAction(action: 'refresh_policyizability_summary') {
  switch (action) {
    case 'refresh_policyizability_summary':
      return 'Refresh policyizability summary'
  }
}

export function formatPolicyizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_memberships' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_memberships':
      return 'Workspace memberships'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchPolicyizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/policyizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return policyizabilityCapabilitiesResponseSchema.parse(await response.json())
}
