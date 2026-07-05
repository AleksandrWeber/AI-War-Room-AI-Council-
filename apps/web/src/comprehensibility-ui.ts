import {
  comprehensibilityAdminActionResponseSchema,
  comprehensibilityAdminSummaryResponseSchema,
  comprehensibilityCapabilitiesResponseSchema,
  comprehensibilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchComprehensibilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/comprehensibility/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return comprehensibilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchComprehensibilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/comprehensibility/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return comprehensibilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeComprehensibilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_comprehensibility_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/comprehensibility/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return comprehensibilityAdminActionResponseSchema.parse(await response.json())
}

export function formatComprehensibilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatComprehensibilityRolloutCheckStatus(
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

export function formatComprehensibilityAdminAction(action: 'refresh_comprehensibility_summary') {
  switch (action) {
    case 'refresh_comprehensibility_summary':
      return 'Refresh comprehensibility summary'
  }
}

export function formatComprehensibilityDomain(
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

export async function fetchComprehensibilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/comprehensibility/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return comprehensibilityCapabilitiesResponseSchema.parse(await response.json())
}
