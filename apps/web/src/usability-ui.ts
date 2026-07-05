import {
  usabilityAdminActionResponseSchema,
  usabilityAdminSummaryResponseSchema,
  usabilityCapabilitiesResponseSchema,
  usabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchUsabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/usability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return usabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchUsabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/usability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return usabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeUsabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_usability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/usability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return usabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatUsabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatUsabilityRolloutCheckStatus(
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

export function formatUsabilityAdminAction(action: 'refresh_usability_summary') {
  switch (action) {
    case 'refresh_usability_summary':
      return 'Refresh usability summary'
  }
}

export function formatUsabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_memberships' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_memberships':
      return 'Workspace memberships'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchUsabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/usability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return usabilityCapabilitiesResponseSchema.parse(await response.json())
}
