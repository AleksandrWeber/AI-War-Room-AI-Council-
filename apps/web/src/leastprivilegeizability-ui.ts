import {
  leastprivilegeizabilityAdminActionResponseSchema,
  leastprivilegeizabilityAdminSummaryResponseSchema,
  leastprivilegeizabilityCapabilitiesResponseSchema,
  leastprivilegeizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchLeastprivilegeizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/leastprivilegeizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return leastprivilegeizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchLeastprivilegeizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/leastprivilegeizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return leastprivilegeizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeLeastprivilegeizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_leastprivilegeizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/leastprivilegeizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return leastprivilegeizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatLeastprivilegeizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatLeastprivilegeizabilityRolloutCheckStatus(
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

export function formatLeastprivilegeizabilityAdminAction(action: 'refresh_leastprivilegeizability_summary') {
  switch (action) {
    case 'refresh_leastprivilegeizability_summary':
      return 'Refresh leastprivilegeizability summary'
  }
}

export function formatLeastprivilegeizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'shield_scans' | 'workspace_provider_credentials',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'shield_scans':
      return 'Shield scans'
    case 'workspace_provider_credentials':
      return 'Provider credentials'
  }
}

export async function fetchLeastprivilegeizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/leastprivilegeizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return leastprivilegeizabilityCapabilitiesResponseSchema.parse(await response.json())
}
