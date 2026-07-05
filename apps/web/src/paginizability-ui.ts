import {
  paginizabilityAdminActionResponseSchema,
  paginizabilityAdminSummaryResponseSchema,
  paginizabilityCapabilitiesResponseSchema,
  paginizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchPaginizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/paginizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return paginizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchPaginizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/paginizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return paginizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executePaginizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_paginizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/paginizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return paginizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatPaginizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatPaginizabilityRolloutCheckStatus(
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

export function formatPaginizabilityAdminAction(action: 'refresh_paginizability_summary') {
  switch (action) {
    case 'refresh_paginizability_summary':
      return 'Refresh paginizability summary'
  }
}

export function formatPaginizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_provider_credentials' | 'model_registry_entries',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_provider_credentials':
      return 'Provider credentials'
    case 'model_registry_entries':
      return 'Model registry entries'
  }
}

export async function fetchPaginizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/paginizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return paginizabilityCapabilitiesResponseSchema.parse(await response.json())
}
