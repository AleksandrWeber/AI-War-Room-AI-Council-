import {
  expressivenessAdminActionResponseSchema,
  expressivenessAdminSummaryResponseSchema,
  expressivenessCapabilitiesResponseSchema,
  expressivenessRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchExpressivenessRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/expressiveness/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return expressivenessRolloutResponseSchema.parse(await response.json())
}

export async function fetchExpressivenessAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/expressiveness/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return expressivenessAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeExpressivenessAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_expressiveness_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/expressiveness/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return expressivenessAdminActionResponseSchema.parse(await response.json())
}

export function formatExpressivenessRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatExpressivenessRolloutCheckStatus(
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

export function formatExpressivenessAdminAction(action: 'refresh_expressiveness_summary') {
  switch (action) {
    case 'refresh_expressiveness_summary':
      return 'Refresh expressiveness summary'
  }
}

export function formatExpressivenessDomain(
  domain: 'completed_runs' | 'failed_runs' | 'agent_outputs' | 'moderator_syntheses',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'agent_outputs':
      return 'Agent outputs'
    case 'moderator_syntheses':
      return 'Moderator syntheses'
  }
}

export async function fetchExpressivenessCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/expressiveness/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return expressivenessCapabilitiesResponseSchema.parse(await response.json())
}
