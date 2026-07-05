import {
  migrationAdminActionResponseSchema,
  migrationAdminSummaryResponseSchema,
  migrationCapabilitiesResponseSchema,
  migrationRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchMigrationRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/migrations/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return migrationRolloutResponseSchema.parse(await response.json())
}

export async function fetchMigrationAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/migrations/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return migrationAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeMigrationAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_migration_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/migrations/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return migrationAdminActionResponseSchema.parse(await response.json())
}

export function formatMigrationRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatMigrationRolloutCheckStatus(
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

export function formatMigrationAdminAction(action: 'refresh_migration_summary') {
  switch (action) {
    case 'refresh_migration_summary':
      return 'Refresh migration summary'
  }
}

export function formatMigrationStatus(status: 'applied' | 'pending') {
  switch (status) {
    case 'applied':
      return 'Applied'
    case 'pending':
      return 'Pending'
  }
}

export async function fetchMigrationCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/migrations/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return migrationCapabilitiesResponseSchema.parse(await response.json())
}
