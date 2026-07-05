import {
  authenticityAdminActionResponseSchema,
  authenticityAdminSummaryResponseSchema,
  authenticityCapabilitiesResponseSchema,
  authenticityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAuthenticityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/authenticity/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return authenticityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAuthenticityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/authenticity/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return authenticityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAuthenticityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_authenticity_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/authenticity/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return authenticityAdminActionResponseSchema.parse(await response.json())
}

export function formatAuthenticityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAuthenticityRolloutCheckStatus(
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

export function formatAuthenticityAdminAction(action: 'refresh_authenticity_summary') {
  switch (action) {
    case 'refresh_authenticity_summary':
      return 'Refresh authenticity summary'
  }
}

export function formatAuthenticityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'moderator_syntheses' | 'artifacts',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'moderator_syntheses':
      return 'Moderator syntheses'
    case 'artifacts':
      return 'Artifacts'
  }
}

export async function fetchAuthenticityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/authenticity/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return authenticityCapabilitiesResponseSchema.parse(await response.json())
}
