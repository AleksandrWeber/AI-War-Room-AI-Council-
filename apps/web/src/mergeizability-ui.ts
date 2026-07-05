import {
  mergeizabilityAdminActionResponseSchema,
  mergeizabilityAdminSummaryResponseSchema,
  mergeizabilityCapabilitiesResponseSchema,
  mergeizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchMergeizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/mergeizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return mergeizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchMergeizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/mergeizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return mergeizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeMergeizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_mergeizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/mergeizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return mergeizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatMergeizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatMergeizabilityRolloutCheckStatus(
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

export function formatMergeizabilityAdminAction(action: 'refresh_mergeizability_summary') {
  switch (action) {
    case 'refresh_mergeizability_summary':
      return 'Refresh mergeizability summary'
  }
}

export function formatMergeizabilityDomain(
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

export async function fetchMergeizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/mergeizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return mergeizabilityCapabilitiesResponseSchema.parse(await response.json())
}
