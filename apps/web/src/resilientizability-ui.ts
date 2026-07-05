import {
  resilientizabilityAdminActionResponseSchema,
  resilientizabilityAdminSummaryResponseSchema,
  resilientizabilityCapabilitiesResponseSchema,
  resilientizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchResilientizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/resilientizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return resilientizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchResilientizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/resilientizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return resilientizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeResilientizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_resilientizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/resilientizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return resilientizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatResilientizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatResilientizabilityRolloutCheckStatus(
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

export function formatResilientizabilityAdminAction(action: 'refresh_resilientizability_summary') {
  switch (action) {
    case 'refresh_resilientizability_summary':
      return 'Refresh resilientizability summary'
  }
}

export function formatResilientizabilityDomain(
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

export async function fetchResilientizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/resilientizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return resilientizabilityCapabilitiesResponseSchema.parse(await response.json())
}
