import {
  adoptabilityAdminActionResponseSchema,
  adoptabilityAdminSummaryResponseSchema,
  adoptabilityCapabilitiesResponseSchema,
  adoptabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAdoptabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/adoptability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return adoptabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAdoptabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/adoptability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return adoptabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAdoptabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_adoptability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/adoptability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return adoptabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAdoptabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAdoptabilityRolloutCheckStatus(
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

export function formatAdoptabilityAdminAction(action: 'refresh_adoptability_summary') {
  switch (action) {
    case 'refresh_adoptability_summary':
      return 'Refresh adoptability summary'
  }
}

export function formatAdoptabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'usage_events' | 'workspace_memberships',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'usage_events':
      return 'Usage events'
    case 'workspace_memberships':
      return 'Workspace memberships'
  }
}

export async function fetchAdoptabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/adoptability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return adoptabilityCapabilitiesResponseSchema.parse(await response.json())
}
