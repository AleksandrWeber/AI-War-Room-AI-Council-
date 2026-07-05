import {
  flexibilityAdminActionResponseSchema,
  flexibilityAdminSummaryResponseSchema,
  flexibilityCapabilitiesResponseSchema,
  flexibilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchFlexibilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/flexibility/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return flexibilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchFlexibilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/flexibility/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return flexibilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeFlexibilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_flexibility_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/flexibility/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return flexibilityAdminActionResponseSchema.parse(await response.json())
}

export function formatFlexibilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatFlexibilityRolloutCheckStatus(
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

export function formatFlexibilityAdminAction(action: 'refresh_flexibility_summary') {
  switch (action) {
    case 'refresh_flexibility_summary':
      return 'Refresh flexibility summary'
  }
}

export function formatFlexibilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'run_workflows' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'run_workflows':
      return 'Run workflows'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchFlexibilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/flexibility/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return flexibilityCapabilitiesResponseSchema.parse(await response.json())
}
