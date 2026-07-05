import {
  taxonomizabilityAdminActionResponseSchema,
  taxonomizabilityAdminSummaryResponseSchema,
  taxonomizabilityCapabilitiesResponseSchema,
  taxonomizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTaxonomizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/taxonomizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return taxonomizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchTaxonomizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/taxonomizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return taxonomizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTaxonomizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_taxonomizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/taxonomizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return taxonomizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatTaxonomizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTaxonomizabilityRolloutCheckStatus(
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

export function formatTaxonomizabilityAdminAction(action: 'refresh_taxonomizability_summary') {
  switch (action) {
    case 'refresh_taxonomizability_summary':
      return 'Refresh taxonomizability summary'
  }
}

export function formatTaxonomizabilityDomain(
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

export async function fetchTaxonomizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/taxonomizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return taxonomizabilityCapabilitiesResponseSchema.parse(await response.json())
}
