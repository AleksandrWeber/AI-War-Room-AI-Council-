import {
  notarledgerizabilityAdminActionResponseSchema,
  notarledgerizabilityAdminSummaryResponseSchema,
  notarledgerizabilityCapabilitiesResponseSchema,
  notarledgerizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchNotarledgerizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/notarledgerizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return notarledgerizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchNotarledgerizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/notarledgerizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return notarledgerizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeNotarledgerizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_notarledgerizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/notarledgerizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return notarledgerizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatNotarledgerizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatNotarledgerizabilityRolloutCheckStatus(
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

export function formatNotarledgerizabilityAdminAction(action: 'refresh_notarledgerizability_summary') {
  switch (action) {
    case 'refresh_notarledgerizability_summary':
      return 'Refresh notarledgerizability summary'
  }
}

export function formatNotarledgerizabilityDomain(
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

export async function fetchNotarledgerizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/notarledgerizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return notarledgerizabilityCapabilitiesResponseSchema.parse(await response.json())
}
