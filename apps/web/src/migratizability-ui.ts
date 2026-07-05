import {
  migratizabilityAdminActionResponseSchema,
  migratizabilityAdminSummaryResponseSchema,
  migratizabilityCapabilitiesResponseSchema,
  migratizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchMigratizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/migratizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return migratizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchMigratizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/migratizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return migratizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeMigratizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_migratizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/migratizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return migratizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatMigratizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatMigratizabilityRolloutCheckStatus(
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

export function formatMigratizabilityAdminAction(action: 'refresh_migratizability_summary') {
  switch (action) {
    case 'refresh_migratizability_summary':
      return 'Refresh migratizability summary'
  }
}

export function formatMigratizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_usage_limits' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_usage_limits':
      return 'Workspace usage limits'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchMigratizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/migratizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return migratizabilityCapabilitiesResponseSchema.parse(await response.json())
}
