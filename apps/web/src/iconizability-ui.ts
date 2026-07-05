import {
  iconizabilityAdminActionResponseSchema,
  iconizabilityAdminSummaryResponseSchema,
  iconizabilityCapabilitiesResponseSchema,
  iconizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchIconizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/iconizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return iconizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchIconizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/iconizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return iconizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeIconizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_iconizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/iconizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return iconizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatIconizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatIconizabilityRolloutCheckStatus(
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

export function formatIconizabilityAdminAction(action: 'refresh_iconizability_summary') {
  switch (action) {
    case 'refresh_iconizability_summary':
      return 'Refresh iconizability summary'
  }
}

export function formatIconizabilityDomain(
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

export async function fetchIconizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/iconizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return iconizabilityCapabilitiesResponseSchema.parse(await response.json())
}
