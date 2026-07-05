import {
  materializabilityAdminActionResponseSchema,
  materializabilityAdminSummaryResponseSchema,
  materializabilityCapabilitiesResponseSchema,
  materializabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchMaterializabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/materializability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return materializabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchMaterializabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/materializability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return materializabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeMaterializabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_materializability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/materializability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return materializabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatMaterializabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatMaterializabilityRolloutCheckStatus(
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

export function formatMaterializabilityAdminAction(action: 'refresh_materializability_summary') {
  switch (action) {
    case 'refresh_materializability_summary':
      return 'Refresh materializability summary'
  }
}

export function formatMaterializabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'run_workflows' | 'artifacts',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'run_workflows':
      return 'Run workflows'
    case 'artifacts':
      return 'Artifacts'
  }
}

export async function fetchMaterializabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/materializability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return materializabilityCapabilitiesResponseSchema.parse(await response.json())
}
