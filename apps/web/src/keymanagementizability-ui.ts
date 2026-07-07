import {
  keymanagementizabilityAdminActionResponseSchema,
  keymanagementizabilityAdminSummaryResponseSchema,
  keymanagementizabilityCapabilitiesResponseSchema,
  keymanagementizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchKeymanagementizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/keymanagementizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return keymanagementizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchKeymanagementizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/keymanagementizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return keymanagementizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeKeymanagementizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_keymanagementizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/keymanagementizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return keymanagementizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatKeymanagementizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatKeymanagementizabilityRolloutCheckStatus(
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

export function formatKeymanagementizabilityAdminAction(action: 'refresh_keymanagementizability_summary') {
  switch (action) {
    case 'refresh_keymanagementizability_summary':
      return 'Refresh keymanagementizability summary'
  }
}

export function formatKeymanagementizabilityDomain(
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

export async function fetchKeymanagementizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/keymanagementizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return keymanagementizabilityCapabilitiesResponseSchema.parse(await response.json())
}
