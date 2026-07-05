import {
  typifiabilityAdminActionResponseSchema,
  typifiabilityAdminSummaryResponseSchema,
  typifiabilityCapabilitiesResponseSchema,
  typifiabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTypifiabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/typifiability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return typifiabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchTypifiabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/typifiability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return typifiabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTypifiabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_typifiability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/typifiability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return typifiabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatTypifiabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTypifiabilityRolloutCheckStatus(
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

export function formatTypifiabilityAdminAction(action: 'refresh_typifiability_summary') {
  switch (action) {
    case 'refresh_typifiability_summary':
      return 'Refresh typifiability summary'
  }
}

export function formatTypifiabilityDomain(
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

export async function fetchTypifiabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/typifiability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return typifiabilityCapabilitiesResponseSchema.parse(await response.json())
}
