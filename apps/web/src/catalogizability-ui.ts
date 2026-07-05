import {
  catalogizabilityAdminActionResponseSchema,
  catalogizabilityAdminSummaryResponseSchema,
  catalogizabilityCapabilitiesResponseSchema,
  catalogizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCatalogizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/catalogizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return catalogizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCatalogizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/catalogizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return catalogizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCatalogizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_catalogizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/catalogizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return catalogizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCatalogizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCatalogizabilityRolloutCheckStatus(
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

export function formatCatalogizabilityAdminAction(action: 'refresh_catalogizability_summary') {
  switch (action) {
    case 'refresh_catalogizability_summary':
      return 'Refresh catalogizability summary'
  }
}

export function formatCatalogizabilityDomain(
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

export async function fetchCatalogizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/catalogizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return catalogizabilityCapabilitiesResponseSchema.parse(await response.json())
}
