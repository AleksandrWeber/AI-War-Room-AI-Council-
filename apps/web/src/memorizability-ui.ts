import {
  memorizabilityAdminActionResponseSchema,
  memorizabilityAdminSummaryResponseSchema,
  memorizabilityCapabilitiesResponseSchema,
  memorizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchMemorizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/memorizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return memorizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchMemorizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/memorizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return memorizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeMemorizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_memorizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/memorizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return memorizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatMemorizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatMemorizabilityRolloutCheckStatus(
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

export function formatMemorizabilityAdminAction(action: 'refresh_memorizability_summary') {
  switch (action) {
    case 'refresh_memorizability_summary':
      return 'Refresh memorizability summary'
  }
}

export function formatMemorizabilityDomain(
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

export async function fetchMemorizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/memorizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return memorizabilityCapabilitiesResponseSchema.parse(await response.json())
}
