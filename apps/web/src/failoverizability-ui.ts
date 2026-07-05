import {
  failoverizabilityAdminActionResponseSchema,
  failoverizabilityAdminSummaryResponseSchema,
  failoverizabilityCapabilitiesResponseSchema,
  failoverizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchFailoverizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/failoverizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return failoverizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchFailoverizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/failoverizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return failoverizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeFailoverizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_failoverizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/failoverizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return failoverizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatFailoverizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatFailoverizabilityRolloutCheckStatus(
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

export function formatFailoverizabilityAdminAction(action: 'refresh_failoverizability_summary') {
  switch (action) {
    case 'refresh_failoverizability_summary':
      return 'Refresh failoverizability summary'
  }
}

export function formatFailoverizabilityDomain(
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

export async function fetchFailoverizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/failoverizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return failoverizabilityCapabilitiesResponseSchema.parse(await response.json())
}
