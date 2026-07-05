import {
  partitionizabilityAdminActionResponseSchema,
  partitionizabilityAdminSummaryResponseSchema,
  partitionizabilityCapabilitiesResponseSchema,
  partitionizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchPartitionizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/partitionizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return partitionizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchPartitionizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/partitionizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return partitionizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executePartitionizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_partitionizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/partitionizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return partitionizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatPartitionizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatPartitionizabilityRolloutCheckStatus(
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

export function formatPartitionizabilityAdminAction(action: 'refresh_partitionizability_summary') {
  switch (action) {
    case 'refresh_partitionizability_summary':
      return 'Refresh partitionizability summary'
  }
}

export function formatPartitionizabilityDomain(
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

export async function fetchPartitionizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/partitionizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return partitionizabilityCapabilitiesResponseSchema.parse(await response.json())
}
