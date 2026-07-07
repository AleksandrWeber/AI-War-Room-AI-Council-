import {
  substantiabilityvaultizabilityAdminActionResponseSchema,
  substantiabilityvaultizabilityAdminSummaryResponseSchema,
  substantiabilityvaultizabilityCapabilitiesResponseSchema,
  substantiabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSubstantiabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/substantiabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return substantiabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSubstantiabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/substantiabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return substantiabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSubstantiabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_substantiabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/substantiabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return substantiabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSubstantiabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSubstantiabilityvaultizabilityRolloutCheckStatus(
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

export function formatSubstantiabilityvaultizabilityAdminAction(action: 'refresh_substantiabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_substantiabilityvaultizability_summary':
      return 'Refresh substantiabilityvaultizability summary'
  }
}

export function formatSubstantiabilityvaultizabilityDomain(
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

export async function fetchSubstantiabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/substantiabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return substantiabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
