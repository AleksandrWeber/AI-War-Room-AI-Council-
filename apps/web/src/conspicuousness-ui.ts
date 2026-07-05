import {
  conspicuousnessAdminActionResponseSchema,
  conspicuousnessAdminSummaryResponseSchema,
  conspicuousnessCapabilitiesResponseSchema,
  conspicuousnessRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchConspicuousnessRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/conspicuousness/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return conspicuousnessRolloutResponseSchema.parse(await response.json())
}

export async function fetchConspicuousnessAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/conspicuousness/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return conspicuousnessAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeConspicuousnessAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_conspicuousness_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/conspicuousness/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return conspicuousnessAdminActionResponseSchema.parse(await response.json())
}

export function formatConspicuousnessRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatConspicuousnessRolloutCheckStatus(
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

export function formatConspicuousnessAdminAction(action: 'refresh_conspicuousness_summary') {
  switch (action) {
    case 'refresh_conspicuousness_summary':
      return 'Refresh conspicuousness summary'
  }
}

export function formatConspicuousnessDomain(
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

export async function fetchConspicuousnessCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/conspicuousness/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return conspicuousnessCapabilitiesResponseSchema.parse(await response.json())
}
