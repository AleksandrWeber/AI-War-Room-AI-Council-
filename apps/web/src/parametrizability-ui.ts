import {
  parametrizabilityAdminActionResponseSchema,
  parametrizabilityAdminSummaryResponseSchema,
  parametrizabilityCapabilitiesResponseSchema,
  parametrizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchParametrizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/parametrizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return parametrizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchParametrizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/parametrizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return parametrizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeParametrizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_parametrizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/parametrizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return parametrizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatParametrizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatParametrizabilityRolloutCheckStatus(
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

export function formatParametrizabilityAdminAction(action: 'refresh_parametrizability_summary') {
  switch (action) {
    case 'refresh_parametrizability_summary':
      return 'Refresh parametrizability summary'
  }
}

export function formatParametrizabilityDomain(
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

export async function fetchParametrizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/parametrizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return parametrizabilityCapabilitiesResponseSchema.parse(await response.json())
}
