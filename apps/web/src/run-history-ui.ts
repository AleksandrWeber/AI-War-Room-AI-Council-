import {
  runHistoryAdminActionResponseSchema,
  runHistoryAdminSummaryResponseSchema,
  runHistoryCapabilitiesResponseSchema,
  runHistoryRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRunHistoryRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/runs/history/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return runHistoryRolloutResponseSchema.parse(await response.json())
}

export async function fetchRunHistoryAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/runs/history/workspace/${encodeURIComponent(workspaceId)}/admin`,
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

  return runHistoryAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRunHistoryAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: {
    action: 'refresh_run_history_summary'
  },
) {
  const response = await fetch(
    `${apiBaseUrl}/runs/history/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return runHistoryAdminActionResponseSchema.parse(await response.json())
}

export async function downloadRunHistoryExport(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  format: 'csv' | 'json',
) {
  const response = await fetch(
    `${apiBaseUrl}/runs/history/workspace/${encodeURIComponent(workspaceId)}/admin/export?format=${format}`,
    {
      headers,
    },
  )

  if (response.status === 403) {
    throw new Error('Only workspace owners and admins can export run history.')
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  const blob = await response.blob()
  const contentDisposition = response.headers.get('content-disposition')
  const filenameMatch = contentDisposition?.match(/filename="([^"]+)"/)
  const filename = filenameMatch?.[1] ?? `${workspaceId}-run-history.${format}`
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function formatRunHistoryRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRunHistoryRolloutCheckStatus(
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

export function formatRunHistoryAdminAction(action: 'refresh_run_history_summary') {
  switch (action) {
    case 'refresh_run_history_summary':
      return 'Refresh run history'
  }
}

export function formatArtifactType(type: string) {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export async function fetchRunHistoryCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/runs/history/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return runHistoryCapabilitiesResponseSchema.parse(await response.json())
}
