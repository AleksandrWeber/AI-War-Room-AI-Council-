import {
  monitorizabilityAdminActionResponseSchema,
  monitorizabilityAdminSummaryResponseSchema,
  monitorizabilityCapabilitiesResponseSchema,
  monitorizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchMonitorizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/monitorizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return monitorizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchMonitorizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/monitorizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return monitorizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeMonitorizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_monitorizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/monitorizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return monitorizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatMonitorizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatMonitorizabilityRolloutCheckStatus(
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

export function formatMonitorizabilityAdminAction(action: 'refresh_monitorizability_summary') {
  switch (action) {
    case 'refresh_monitorizability_summary':
      return 'Refresh monitorizability summary'
  }
}

export function formatMonitorizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_memberships' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_memberships':
      return 'Workspace memberships'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchMonitorizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/monitorizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return monitorizabilityCapabilitiesResponseSchema.parse(await response.json())
}
