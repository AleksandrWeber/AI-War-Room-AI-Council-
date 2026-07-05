import {
  resilienceAdminActionResponseSchema,
  resilienceAdminSummaryResponseSchema,
  resilienceCapabilitiesResponseSchema,
  resilienceRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchResilienceRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/resilience/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return resilienceRolloutResponseSchema.parse(await response.json())
}

export async function fetchResilienceAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/resilience/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return resilienceAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeResilienceAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_resilience_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/resilience/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return resilienceAdminActionResponseSchema.parse(await response.json())
}

export function formatResilienceRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatResilienceRolloutCheckStatus(
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

export function formatResilienceAdminAction(
  action: 'refresh_resilience_summary',
) {
  switch (action) {
    case 'refresh_resilience_summary':
      return 'Refresh resilience summary'
  }
}

export function formatResilienceDomain(
  domain:
    | 'completed_runs'
    | 'failed_runs'
    | 'run_workflows'
    | 'applied_migrations',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'run_workflows':
      return 'Run workflows'
    case 'applied_migrations':
      return 'Applied migrations'
  }
}

export async function fetchResilienceCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/resilience/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return resilienceCapabilitiesResponseSchema.parse(await response.json())
}
