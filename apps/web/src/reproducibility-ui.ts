import {
  reproducibilityAdminActionResponseSchema,
  reproducibilityAdminSummaryResponseSchema,
  reproducibilityCapabilitiesResponseSchema,
  reproducibilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchReproducibilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/reproducibility/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return reproducibilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchReproducibilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/reproducibility/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return reproducibilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeReproducibilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_reproducibility_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/reproducibility/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return reproducibilityAdminActionResponseSchema.parse(await response.json())
}

export function formatReproducibilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatReproducibilityRolloutCheckStatus(
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

export function formatReproducibilityAdminAction(action: 'refresh_reproducibility_summary') {
  switch (action) {
    case 'refresh_reproducibility_summary':
      return 'Refresh reproducibility summary'
  }
}

export function formatReproducibilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'idempotency_keys' | 'run_workflows',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'idempotency_keys':
      return 'Idempotency keys'
    case 'run_workflows':
      return 'Run workflows'
  }
}

export async function fetchReproducibilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/reproducibility/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return reproducibilityCapabilitiesResponseSchema.parse(await response.json())
}
