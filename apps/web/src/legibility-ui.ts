import {
  legibilityAdminActionResponseSchema,
  legibilityAdminSummaryResponseSchema,
  legibilityCapabilitiesResponseSchema,
  legibilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchLegibilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/legibility/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return legibilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchLegibilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/legibility/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return legibilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeLegibilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_legibility_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/legibility/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return legibilityAdminActionResponseSchema.parse(await response.json())
}

export function formatLegibilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatLegibilityRolloutCheckStatus(
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

export function formatLegibilityAdminAction(action: 'refresh_legibility_summary') {
  switch (action) {
    case 'refresh_legibility_summary':
      return 'Refresh legibility summary'
  }
}

export function formatLegibilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'artifacts' | 'run_workflows',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'artifacts':
      return 'Artifacts'
    case 'run_workflows':
      return 'Run workflows'
  }
}

export async function fetchLegibilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/legibility/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return legibilityCapabilitiesResponseSchema.parse(await response.json())
}
