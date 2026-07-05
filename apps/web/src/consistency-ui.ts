import {
  consistencyAdminActionResponseSchema,
  consistencyAdminSummaryResponseSchema,
  consistencyCapabilitiesResponseSchema,
  consistencyRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchConsistencyRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/consistency/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return consistencyRolloutResponseSchema.parse(await response.json())
}

export async function fetchConsistencyAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/consistency/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return consistencyAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeConsistencyAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_consistency_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/consistency/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return consistencyAdminActionResponseSchema.parse(await response.json())
}

export function formatConsistencyRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatConsistencyRolloutCheckStatus(
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

export function formatConsistencyAdminAction(
  action: 'refresh_consistency_summary',
) {
  switch (action) {
    case 'refresh_consistency_summary':
      return 'Refresh consistency summary'
  }
}

export function formatConsistencyDomain(
  domain:
    | 'completed_runs'
    | 'failed_runs'
    | 'run_workflows'
    | 'idempotency_keys',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'run_workflows':
      return 'Run workflows'
    case 'idempotency_keys':
      return 'Idempotency keys'
  }
}

export async function fetchConsistencyCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/consistency/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return consistencyCapabilitiesResponseSchema.parse(await response.json())
}
