import {
  recoverabilityAdminActionResponseSchema,
  recoverabilityAdminSummaryResponseSchema,
  recoverabilityCapabilitiesResponseSchema,
  recoverabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRecoverabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/recoverability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return recoverabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRecoverabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/recoverability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return recoverabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRecoverabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_recoverability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/recoverability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return recoverabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRecoverabilityRolloutStatus(
  status: 'ready' | 'not_ready',
) {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRecoverabilityRolloutCheckStatus(
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

export function formatRecoverabilityAdminAction(
  action: 'refresh_recoverability_summary',
) {
  switch (action) {
    case 'refresh_recoverability_summary':
      return 'Refresh recoverability summary'
  }
}

export function formatRecoverabilityDomain(
  domain:
    | 'completed_runs'
    | 'failed_runs'
    | 'blocked_runs'
    | 'run_workflows',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'blocked_runs':
      return 'Blocked runs'
    case 'run_workflows':
      return 'Run workflows'
  }
}

export async function fetchRecoverabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/recoverability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return recoverabilityCapabilitiesResponseSchema.parse(await response.json())
}
