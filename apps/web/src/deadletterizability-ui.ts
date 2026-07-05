import {
  deadletterizabilityAdminActionResponseSchema,
  deadletterizabilityAdminSummaryResponseSchema,
  deadletterizabilityCapabilitiesResponseSchema,
  deadletterizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDeadletterizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/deadletterizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deadletterizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDeadletterizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/deadletterizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deadletterizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDeadletterizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_deadletterizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/deadletterizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return deadletterizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDeadletterizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDeadletterizabilityRolloutCheckStatus(
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

export function formatDeadletterizabilityAdminAction(action: 'refresh_deadletterizability_summary') {
  switch (action) {
    case 'refresh_deadletterizability_summary':
      return 'Refresh deadletterizability summary'
  }
}

export function formatDeadletterizabilityDomain(
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

export async function fetchDeadletterizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/deadletterizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deadletterizabilityCapabilitiesResponseSchema.parse(await response.json())
}
