import {
  notarjournalizabilityAdminActionResponseSchema,
  notarjournalizabilityAdminSummaryResponseSchema,
  notarjournalizabilityCapabilitiesResponseSchema,
  notarjournalizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchNotarjournalizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/notarjournalizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return notarjournalizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchNotarjournalizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/notarjournalizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return notarjournalizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeNotarjournalizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_notarjournalizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/notarjournalizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return notarjournalizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatNotarjournalizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatNotarjournalizabilityRolloutCheckStatus(
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

export function formatNotarjournalizabilityAdminAction(action: 'refresh_notarjournalizability_summary') {
  switch (action) {
    case 'refresh_notarjournalizability_summary':
      return 'Refresh notarjournalizability summary'
  }
}

export function formatNotarjournalizabilityDomain(
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

export async function fetchNotarjournalizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/notarjournalizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return notarjournalizabilityCapabilitiesResponseSchema.parse(await response.json())
}
