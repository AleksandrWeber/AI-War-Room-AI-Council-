import {
  searchizabilityAdminActionResponseSchema,
  searchizabilityAdminSummaryResponseSchema,
  searchizabilityCapabilitiesResponseSchema,
  searchizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSearchizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/searchizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return searchizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSearchizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/searchizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return searchizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSearchizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_searchizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/searchizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return searchizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSearchizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSearchizabilityRolloutCheckStatus(
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

export function formatSearchizabilityAdminAction(action: 'refresh_searchizability_summary') {
  switch (action) {
    case 'refresh_searchizability_summary':
      return 'Refresh searchizability summary'
  }
}

export function formatSearchizabilityDomain(
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

export async function fetchSearchizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/searchizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return searchizabilityCapabilitiesResponseSchema.parse(await response.json())
}
