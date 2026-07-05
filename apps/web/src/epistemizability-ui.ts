import {
  epistemizabilityAdminActionResponseSchema,
  epistemizabilityAdminSummaryResponseSchema,
  epistemizabilityCapabilitiesResponseSchema,
  epistemizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchEpistemizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/epistemizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return epistemizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchEpistemizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/epistemizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return epistemizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeEpistemizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_epistemizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/epistemizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return epistemizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatEpistemizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatEpistemizabilityRolloutCheckStatus(
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

export function formatEpistemizabilityAdminAction(action: 'refresh_epistemizability_summary') {
  switch (action) {
    case 'refresh_epistemizability_summary':
      return 'Refresh epistemizability summary'
  }
}

export function formatEpistemizabilityDomain(
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

export async function fetchEpistemizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/epistemizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return epistemizabilityCapabilitiesResponseSchema.parse(await response.json())
}
