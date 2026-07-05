import {
  batchizabilityAdminActionResponseSchema,
  batchizabilityAdminSummaryResponseSchema,
  batchizabilityCapabilitiesResponseSchema,
  batchizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchBatchizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/batchizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return batchizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchBatchizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/batchizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return batchizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeBatchizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_batchizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/batchizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return batchizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatBatchizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatBatchizabilityRolloutCheckStatus(
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

export function formatBatchizabilityAdminAction(action: 'refresh_batchizability_summary') {
  switch (action) {
    case 'refresh_batchizability_summary':
      return 'Refresh batchizability summary'
  }
}

export function formatBatchizabilityDomain(
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

export async function fetchBatchizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/batchizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return batchizabilityCapabilitiesResponseSchema.parse(await response.json())
}
