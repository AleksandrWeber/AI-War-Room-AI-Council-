import {
  backupAdminActionResponseSchema,
  backupAdminSummaryResponseSchema,
  backupCapabilitiesResponseSchema,
  backupRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchBackupRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/backup/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return backupRolloutResponseSchema.parse(await response.json())
}

export async function fetchBackupAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/backup/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return backupAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeBackupAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_backup_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/backup/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return backupAdminActionResponseSchema.parse(await response.json())
}

export function formatBackupRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatBackupRolloutCheckStatus(
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

export function formatBackupAdminAction(action: 'refresh_backup_summary') {
  switch (action) {
    case 'refresh_backup_summary':
      return 'Refresh backup summary'
  }
}

export function formatBackupDomain(
  domain: 'runs' | 'artifacts' | 'usage_events' | 'workspace_memberships',
) {
  switch (domain) {
    case 'runs':
      return 'Runs'
    case 'artifacts':
      return 'Artifacts'
    case 'usage_events':
      return 'Usage events'
    case 'workspace_memberships':
      return 'Workspace memberships'
  }
}

export async function fetchBackupCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/backup/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return backupCapabilitiesResponseSchema.parse(await response.json())
}
