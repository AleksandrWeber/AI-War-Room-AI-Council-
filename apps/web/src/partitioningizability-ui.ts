import {
  partitioningizabilityAdminActionResponseSchema,
  partitioningizabilityAdminSummaryResponseSchema,
  partitioningizabilityCapabilitiesResponseSchema,
  partitioningizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchPartitioningizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/partitioningizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return partitioningizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchPartitioningizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/partitioningizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return partitioningizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executePartitioningizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_partitioningizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/partitioningizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return partitioningizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatPartitioningizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatPartitioningizabilityRolloutCheckStatus(
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

export function formatPartitioningizabilityAdminAction(action: 'refresh_partitioningizability_summary') {
  switch (action) {
    case 'refresh_partitioningizability_summary':
      return 'Refresh partitioningizability summary'
  }
}

export function formatPartitioningizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_memberships' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_memberships':
      return 'Workspace memberships'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchPartitioningizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/partitioningizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return partitioningizabilityCapabilitiesResponseSchema.parse(await response.json())
}
