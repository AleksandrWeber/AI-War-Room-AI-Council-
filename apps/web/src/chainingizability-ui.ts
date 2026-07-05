import {
  chainingizabilityAdminActionResponseSchema,
  chainingizabilityAdminSummaryResponseSchema,
  chainingizabilityCapabilitiesResponseSchema,
  chainingizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchChainingizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/chainingizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return chainingizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchChainingizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/chainingizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return chainingizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeChainingizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_chainingizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/chainingizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return chainingizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatChainingizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatChainingizabilityRolloutCheckStatus(
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

export function formatChainingizabilityAdminAction(action: 'refresh_chainingizability_summary') {
  switch (action) {
    case 'refresh_chainingizability_summary':
      return 'Refresh chainingizability summary'
  }
}

export function formatChainingizabilityDomain(
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

export async function fetchChainingizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/chainingizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return chainingizabilityCapabilitiesResponseSchema.parse(await response.json())
}
