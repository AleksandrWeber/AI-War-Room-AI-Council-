import {
  routizabilityAdminActionResponseSchema,
  routizabilityAdminSummaryResponseSchema,
  routizabilityCapabilitiesResponseSchema,
  routizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRoutizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/routizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return routizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRoutizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/routizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return routizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRoutizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_routizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/routizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return routizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRoutizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRoutizabilityRolloutCheckStatus(
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

export function formatRoutizabilityAdminAction(action: 'refresh_routizability_summary') {
  switch (action) {
    case 'refresh_routizability_summary':
      return 'Refresh routizability summary'
  }
}

export function formatRoutizabilityDomain(
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

export async function fetchRoutizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/routizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return routizabilityCapabilitiesResponseSchema.parse(await response.json())
}
