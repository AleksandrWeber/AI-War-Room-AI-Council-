import {
  glossarizabilityAdminActionResponseSchema,
  glossarizabilityAdminSummaryResponseSchema,
  glossarizabilityCapabilitiesResponseSchema,
  glossarizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchGlossarizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/glossarizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return glossarizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchGlossarizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/glossarizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return glossarizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeGlossarizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_glossarizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/glossarizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return glossarizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatGlossarizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatGlossarizabilityRolloutCheckStatus(
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

export function formatGlossarizabilityAdminAction(action: 'refresh_glossarizability_summary') {
  switch (action) {
    case 'refresh_glossarizability_summary':
      return 'Refresh glossarizability summary'
  }
}

export function formatGlossarizabilityDomain(
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

export async function fetchGlossarizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/glossarizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return glossarizabilityCapabilitiesResponseSchema.parse(await response.json())
}
