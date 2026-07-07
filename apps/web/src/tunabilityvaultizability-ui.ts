import {
  tunabilityvaultizabilityAdminActionResponseSchema,
  tunabilityvaultizabilityAdminSummaryResponseSchema,
  tunabilityvaultizabilityCapabilitiesResponseSchema,
  tunabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTunabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/tunabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return tunabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchTunabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/tunabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return tunabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTunabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_tunabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/tunabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return tunabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatTunabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTunabilityvaultizabilityRolloutCheckStatus(
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

export function formatTunabilityvaultizabilityAdminAction(action: 'refresh_tunabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_tunabilityvaultizability_summary':
      return 'Refresh tunabilityvaultizability summary'
  }
}

export function formatTunabilityvaultizabilityDomain(
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

export async function fetchTunabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/tunabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return tunabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
