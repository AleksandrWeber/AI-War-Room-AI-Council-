import {
  automatabilityAdminActionResponseSchema,
  automatabilityAdminSummaryResponseSchema,
  automatabilityCapabilitiesResponseSchema,
  automatabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAutomatabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/automatability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return automatabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAutomatabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/automatability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return automatabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAutomatabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_automatability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/automatability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return automatabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAutomatabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAutomatabilityRolloutCheckStatus(
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

export function formatAutomatabilityAdminAction(action: 'refresh_automatability_summary') {
  switch (action) {
    case 'refresh_automatability_summary':
      return 'Refresh automatability summary'
  }
}

export function formatAutomatabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'agent_outputs' | 'artifacts',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'agent_outputs':
      return 'Agent outputs'
    case 'artifacts':
      return 'Artifacts'
  }
}

export async function fetchAutomatabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/automatability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return automatabilityCapabilitiesResponseSchema.parse(await response.json())
}
