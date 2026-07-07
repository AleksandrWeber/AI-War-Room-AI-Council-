import {
  proofjournalizabilityAdminActionResponseSchema,
  proofjournalizabilityAdminSummaryResponseSchema,
  proofjournalizabilityCapabilitiesResponseSchema,
  proofjournalizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchProofjournalizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/proofjournalizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return proofjournalizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchProofjournalizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/proofjournalizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return proofjournalizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeProofjournalizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_proofjournalizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/proofjournalizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return proofjournalizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatProofjournalizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatProofjournalizabilityRolloutCheckStatus(
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

export function formatProofjournalizabilityAdminAction(action: 'refresh_proofjournalizability_summary') {
  switch (action) {
    case 'refresh_proofjournalizability_summary':
      return 'Refresh proofjournalizability summary'
  }
}

export function formatProofjournalizabilityDomain(
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

export async function fetchProofjournalizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/proofjournalizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return proofjournalizabilityCapabilitiesResponseSchema.parse(await response.json())
}
