import {
  composabilityAdminActionResponseSchema,
  composabilityAdminSummaryResponseSchema,
  composabilityCapabilitiesResponseSchema,
  composabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchComposabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/composability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return composabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchComposabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/composability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return composabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeComposabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_composability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/composability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return composabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatComposabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatComposabilityRolloutCheckStatus(
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

export function formatComposabilityAdminAction(action: 'refresh_composability_summary') {
  switch (action) {
    case 'refresh_composability_summary':
      return 'Refresh composability summary'
  }
}

export function formatComposabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'run_workflows' | 'agent_outputs',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'run_workflows':
      return 'Run workflows'
    case 'agent_outputs':
      return 'Agent outputs'
  }
}

export async function fetchComposabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/composability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return composabilityCapabilitiesResponseSchema.parse(await response.json())
}
