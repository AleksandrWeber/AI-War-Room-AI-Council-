import {
  defensibilityAdminActionResponseSchema,
  defensibilityAdminSummaryResponseSchema,
  defensibilityCapabilitiesResponseSchema,
  defensibilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDefensibilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/defensibility/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return defensibilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDefensibilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/defensibility/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return defensibilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDefensibilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_defensibility_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/defensibility/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return defensibilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDefensibilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDefensibilityRolloutCheckStatus(
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

export function formatDefensibilityAdminAction(action: 'refresh_defensibility_summary') {
  switch (action) {
    case 'refresh_defensibility_summary':
      return 'Refresh defensibility summary'
  }
}

export function formatDefensibilityDomain(
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

export async function fetchDefensibilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/defensibility/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return defensibilityCapabilitiesResponseSchema.parse(await response.json())
}
