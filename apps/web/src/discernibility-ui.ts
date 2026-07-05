import {
  discernibilityAdminActionResponseSchema,
  discernibilityAdminSummaryResponseSchema,
  discernibilityCapabilitiesResponseSchema,
  discernibilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDiscernibilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/discernibility/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return discernibilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDiscernibilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/discernibility/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return discernibilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDiscernibilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_discernibility_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/discernibility/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return discernibilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDiscernibilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDiscernibilityRolloutCheckStatus(
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

export function formatDiscernibilityAdminAction(action: 'refresh_discernibility_summary') {
  switch (action) {
    case 'refresh_discernibility_summary':
      return 'Refresh discernibility summary'
  }
}

export function formatDiscernibilityDomain(
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

export async function fetchDiscernibilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/discernibility/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return discernibilityCapabilitiesResponseSchema.parse(await response.json())
}
