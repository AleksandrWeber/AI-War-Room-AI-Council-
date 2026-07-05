import {
  understandabilityAdminActionResponseSchema,
  understandabilityAdminSummaryResponseSchema,
  understandabilityCapabilitiesResponseSchema,
  understandabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchUnderstandabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/understandability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return understandabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchUnderstandabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/understandability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return understandabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeUnderstandabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_understandability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/understandability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return understandabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatUnderstandabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatUnderstandabilityRolloutCheckStatus(
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

export function formatUnderstandabilityAdminAction(action: 'refresh_understandability_summary') {
  switch (action) {
    case 'refresh_understandability_summary':
      return 'Refresh understandability summary'
  }
}

export function formatUnderstandabilityDomain(
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

export async function fetchUnderstandabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/understandability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return understandabilityCapabilitiesResponseSchema.parse(await response.json())
}
