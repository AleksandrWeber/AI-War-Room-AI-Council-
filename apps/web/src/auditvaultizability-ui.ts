import {
  auditvaultizabilityAdminActionResponseSchema,
  auditvaultizabilityAdminSummaryResponseSchema,
  auditvaultizabilityCapabilitiesResponseSchema,
  auditvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAuditvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/auditvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return auditvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAuditvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/auditvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return auditvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAuditvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_auditvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/auditvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return auditvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAuditvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAuditvaultizabilityRolloutCheckStatus(
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

export function formatAuditvaultizabilityAdminAction(action: 'refresh_auditvaultizability_summary') {
  switch (action) {
    case 'refresh_auditvaultizability_summary':
      return 'Refresh auditvaultizability summary'
  }
}

export function formatAuditvaultizabilityDomain(
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

export async function fetchAuditvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/auditvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return auditvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
