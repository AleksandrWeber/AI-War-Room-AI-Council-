import {
  idempotencyAdminActionResponseSchema,
  idempotencyAdminSummaryResponseSchema,
  idempotencyCapabilitiesResponseSchema,
  idempotencyRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchIdempotencyRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/idempotency/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return idempotencyRolloutResponseSchema.parse(await response.json())
}

export async function fetchIdempotencyAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/idempotency/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return idempotencyAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeIdempotencyAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: {
    action:
      | 'refresh_idempotency_summary'
      | 'clear_workspace_idempotency_reservations'
  },
) {
  const response = await fetch(
    `${apiBaseUrl}/idempotency/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return idempotencyAdminActionResponseSchema.parse(await response.json())
}

export function formatIdempotencyRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatIdempotencyRolloutCheckStatus(
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

export function formatIdempotencyAdminAction(
  action:
    | 'refresh_idempotency_summary'
    | 'clear_workspace_idempotency_reservations'
    | 'purge_expired_idempotency_keys',
) {
  switch (action) {
    case 'refresh_idempotency_summary':
      return 'Refresh idempotency summary'
    case 'clear_workspace_idempotency_reservations':
      return 'Clear idempotency reservations'
    case 'purge_expired_idempotency_keys':
      return 'Purge expired idempotency keys'
  }
}

export async function fetchIdempotencyCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/idempotency/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return idempotencyCapabilitiesResponseSchema.parse(await response.json())
}
