import {
  cacheizabilityAdminActionResponseSchema,
  cacheizabilityAdminSummaryResponseSchema,
  cacheizabilityCapabilitiesResponseSchema,
  cacheizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCacheizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/cacheizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return cacheizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCacheizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/cacheizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return cacheizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCacheizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_cacheizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/cacheizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return cacheizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCacheizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCacheizabilityRolloutCheckStatus(
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

export function formatCacheizabilityAdminAction(action: 'refresh_cacheizability_summary') {
  switch (action) {
    case 'refresh_cacheizability_summary':
      return 'Refresh cacheizability summary'
  }
}

export function formatCacheizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'model_health_events' | 'billing_records',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'model_health_events':
      return 'Model health events'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchCacheizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/cacheizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return cacheizabilityCapabilitiesResponseSchema.parse(await response.json())
}
