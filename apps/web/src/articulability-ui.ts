import {
  articulabilityAdminActionResponseSchema,
  articulabilityAdminSummaryResponseSchema,
  articulabilityCapabilitiesResponseSchema,
  articulabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchArticulabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/articulability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return articulabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchArticulabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/articulability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return articulabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeArticulabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_articulability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/articulability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return articulabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatArticulabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatArticulabilityRolloutCheckStatus(
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

export function formatArticulabilityAdminAction(action: 'refresh_articulability_summary') {
  switch (action) {
    case 'refresh_articulability_summary':
      return 'Refresh articulability summary'
  }
}

export function formatArticulabilityDomain(
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

export async function fetchArticulabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/articulability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return articulabilityCapabilitiesResponseSchema.parse(await response.json())
}
