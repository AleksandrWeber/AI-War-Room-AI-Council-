import {
  clusterizabilityAdminActionResponseSchema,
  clusterizabilityAdminSummaryResponseSchema,
  clusterizabilityCapabilitiesResponseSchema,
  clusterizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchClusterizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/clusterizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return clusterizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchClusterizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/clusterizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return clusterizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeClusterizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_clusterizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/clusterizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return clusterizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatClusterizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatClusterizabilityRolloutCheckStatus(
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

export function formatClusterizabilityAdminAction(action: 'refresh_clusterizability_summary') {
  switch (action) {
    case 'refresh_clusterizability_summary':
      return 'Refresh clusterizability summary'
  }
}

export function formatClusterizabilityDomain(
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

export async function fetchClusterizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/clusterizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return clusterizabilityCapabilitiesResponseSchema.parse(await response.json())
}
