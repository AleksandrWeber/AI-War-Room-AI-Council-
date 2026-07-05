import {
  illustratabilityAdminActionResponseSchema,
  illustratabilityAdminSummaryResponseSchema,
  illustratabilityCapabilitiesResponseSchema,
  illustratabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchIllustratabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/illustratability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return illustratabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchIllustratabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/illustratability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return illustratabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeIllustratabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_illustratability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/illustratability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return illustratabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatIllustratabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatIllustratabilityRolloutCheckStatus(
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

export function formatIllustratabilityAdminAction(action: 'refresh_illustratability_summary') {
  switch (action) {
    case 'refresh_illustratability_summary':
      return 'Refresh illustratability summary'
  }
}

export function formatIllustratabilityDomain(
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

export async function fetchIllustratabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/illustratability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return illustratabilityCapabilitiesResponseSchema.parse(await response.json())
}
