import {
  clarityAdminActionResponseSchema,
  clarityAdminSummaryResponseSchema,
  clarityCapabilitiesResponseSchema,
  clarityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchClarityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/clarity/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return clarityRolloutResponseSchema.parse(await response.json())
}

export async function fetchClarityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/clarity/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return clarityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeClarityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_clarity_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/clarity/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return clarityAdminActionResponseSchema.parse(await response.json())
}

export function formatClarityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatClarityRolloutCheckStatus(
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

export function formatClarityAdminAction(action: 'refresh_clarity_summary') {
  switch (action) {
    case 'refresh_clarity_summary':
      return 'Refresh clarity summary'
  }
}

export function formatClarityDomain(
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

export async function fetchClarityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/clarity/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return clarityCapabilitiesResponseSchema.parse(await response.json())
}
