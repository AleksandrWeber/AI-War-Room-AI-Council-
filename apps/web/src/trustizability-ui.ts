import {
  trustizabilityAdminActionResponseSchema,
  trustizabilityAdminSummaryResponseSchema,
  trustizabilityCapabilitiesResponseSchema,
  trustizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTrustizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/trustizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return trustizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchTrustizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/trustizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return trustizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTrustizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_trustizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/trustizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return trustizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatTrustizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTrustizabilityRolloutCheckStatus(
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

export function formatTrustizabilityAdminAction(action: 'refresh_trustizability_summary') {
  switch (action) {
    case 'refresh_trustizability_summary':
      return 'Refresh trustizability summary'
  }
}

export function formatTrustizabilityDomain(
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

export async function fetchTrustizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/trustizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return trustizabilityCapabilitiesResponseSchema.parse(await response.json())
}
