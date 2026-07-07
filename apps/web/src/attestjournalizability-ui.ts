import {
  attestjournalizabilityAdminActionResponseSchema,
  attestjournalizabilityAdminSummaryResponseSchema,
  attestjournalizabilityCapabilitiesResponseSchema,
  attestjournalizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAttestjournalizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/attestjournalizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return attestjournalizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAttestjournalizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/attestjournalizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return attestjournalizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAttestjournalizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_attestjournalizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/attestjournalizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return attestjournalizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAttestjournalizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAttestjournalizabilityRolloutCheckStatus(
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

export function formatAttestjournalizabilityAdminAction(action: 'refresh_attestjournalizability_summary') {
  switch (action) {
    case 'refresh_attestjournalizability_summary':
      return 'Refresh attestjournalizability summary'
  }
}

export function formatAttestjournalizabilityDomain(
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

export async function fetchAttestjournalizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/attestjournalizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return attestjournalizabilityCapabilitiesResponseSchema.parse(await response.json())
}
