import {
  parabolizabilityAdminActionResponseSchema,
  parabolizabilityAdminSummaryResponseSchema,
  parabolizabilityCapabilitiesResponseSchema,
  parabolizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchParabolizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/parabolizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return parabolizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchParabolizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/parabolizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return parabolizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeParabolizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_parabolizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/parabolizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return parabolizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatParabolizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatParabolizabilityRolloutCheckStatus(
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

export function formatParabolizabilityAdminAction(action: 'refresh_parabolizability_summary') {
  switch (action) {
    case 'refresh_parabolizability_summary':
      return 'Refresh parabolizability summary'
  }
}

export function formatParabolizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'moderator_syntheses' | 'agent_outputs',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'moderator_syntheses':
      return 'Moderator syntheses'
    case 'agent_outputs':
      return 'Agent outputs'
  }
}

export async function fetchParabolizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/parabolizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return parabolizabilityCapabilitiesResponseSchema.parse(await response.json())
}
