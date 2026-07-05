import {
  streamRecoveryAdminActionResponseSchema,
  streamRecoveryAdminSummaryResponseSchema,
  streamReplayCapabilitiesResponseSchema,
  streamReplayRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchStreamReplayRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/runs/stream/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return streamReplayRolloutResponseSchema.parse(await response.json())
}

export async function fetchStreamRecoveryAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/runs/stream/workspace/${encodeURIComponent(workspaceId)}/admin`,
    {
      headers,
    },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return streamRecoveryAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeStreamRecoveryAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: {
    action: 'refresh_stream_recovery_summary' | 'clear_workspace_stream_buffers'
  },
) {
  const response = await fetch(
    `${apiBaseUrl}/runs/stream/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return streamRecoveryAdminActionResponseSchema.parse(await response.json())
}

export function formatStreamReplayRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatStreamReplayRolloutCheckStatus(
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

export function formatStreamRecoveryAdminAction(
  action: 'refresh_stream_recovery_summary' | 'clear_workspace_stream_buffers',
) {
  switch (action) {
    case 'refresh_stream_recovery_summary':
      return 'Refresh stream recovery'
    case 'clear_workspace_stream_buffers':
      return 'Clear stream buffers'
  }
}

export function formatStreamEventType(type: string) {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export async function fetchStreamReplayCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/runs/stream/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return streamReplayCapabilitiesResponseSchema.parse(await response.json())
}
