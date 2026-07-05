import {
  assuranceAdminActionResponseSchema,
  assuranceAdminSummaryResponseSchema,
  assuranceCapabilitiesResponseSchema,
  assuranceRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAssuranceRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/assurance/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return assuranceRolloutResponseSchema.parse(await response.json())
}

export async function fetchAssuranceAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/assurance/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return assuranceAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAssuranceAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_assurance_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/assurance/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return assuranceAdminActionResponseSchema.parse(await response.json())
}

export function formatAssuranceRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAssuranceRolloutCheckStatus(
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

export function formatAssuranceAdminAction(
  action: 'refresh_assurance_summary',
) {
  switch (action) {
    case 'refresh_assurance_summary':
      return 'Refresh assurance summary'
  }
}

export function formatAssuranceDomain(
  domain: 'completed_runs' | 'failed_runs' | 'shield_reviews' | 'artifacts',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'shield_reviews':
      return 'Shield reviews'
    case 'artifacts':
      return 'Artifacts'
  }
}

export async function fetchAssuranceCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/assurance/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return assuranceCapabilitiesResponseSchema.parse(await response.json())
}
