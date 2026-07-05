import {
  shardingizabilityAdminActionResponseSchema,
  shardingizabilityAdminSummaryResponseSchema,
  shardingizabilityCapabilitiesResponseSchema,
  shardingizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchShardingizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/shardingizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return shardingizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchShardingizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/shardingizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return shardingizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeShardingizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_shardingizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/shardingizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return shardingizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatShardingizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatShardingizabilityRolloutCheckStatus(
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

export function formatShardingizabilityAdminAction(action: 'refresh_shardingizability_summary') {
  switch (action) {
    case 'refresh_shardingizability_summary':
      return 'Refresh shardingizability summary'
  }
}

export function formatShardingizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'idempotency_keys' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'idempotency_keys':
      return 'Idempotency keys'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchShardingizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/shardingizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return shardingizabilityCapabilitiesResponseSchema.parse(await response.json())
}
