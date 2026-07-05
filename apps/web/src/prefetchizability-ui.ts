import {
  prefetchizabilityAdminActionResponseSchema,
  prefetchizabilityAdminSummaryResponseSchema,
  prefetchizabilityCapabilitiesResponseSchema,
  prefetchizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchPrefetchizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/prefetchizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return prefetchizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchPrefetchizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/prefetchizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return prefetchizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executePrefetchizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_prefetchizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/prefetchizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return prefetchizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatPrefetchizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatPrefetchizabilityRolloutCheckStatus(
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

export function formatPrefetchizabilityAdminAction(action: 'refresh_prefetchizability_summary') {
  switch (action) {
    case 'refresh_prefetchizability_summary':
      return 'Refresh prefetchizability summary'
  }
}

export function formatPrefetchizabilityDomain(
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

export async function fetchPrefetchizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/prefetchizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return prefetchizabilityCapabilitiesResponseSchema.parse(await response.json())
}
