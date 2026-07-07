import {
  reproducibilityvaultizabilityAdminActionResponseSchema,
  reproducibilityvaultizabilityAdminSummaryResponseSchema,
  reproducibilityvaultizabilityCapabilitiesResponseSchema,
  reproducibilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchReproducibilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/reproducibilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return reproducibilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchReproducibilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/reproducibilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return reproducibilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeReproducibilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_reproducibilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/reproducibilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return reproducibilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatReproducibilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatReproducibilityvaultizabilityRolloutCheckStatus(
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

export function formatReproducibilityvaultizabilityAdminAction(action: 'refresh_reproducibilityvaultizability_summary') {
  switch (action) {
    case 'refresh_reproducibilityvaultizability_summary':
      return 'Refresh reproducibilityvaultizability summary'
  }
}

export function formatReproducibilityvaultizabilityDomain(
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

export async function fetchReproducibilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/reproducibilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return reproducibilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
