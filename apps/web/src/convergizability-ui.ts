import {
  convergizabilityAdminActionResponseSchema,
  convergizabilityAdminSummaryResponseSchema,
  convergizabilityCapabilitiesResponseSchema,
  convergizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchConvergizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/convergizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return convergizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchConvergizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/convergizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return convergizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeConvergizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_convergizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/convergizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return convergizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatConvergizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatConvergizabilityRolloutCheckStatus(
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

export function formatConvergizabilityAdminAction(action: 'refresh_convergizability_summary') {
  switch (action) {
    case 'refresh_convergizability_summary':
      return 'Refresh convergizability summary'
  }
}

export function formatConvergizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_usage_limits' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_usage_limits':
      return 'Workspace usage limits'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchConvergizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/convergizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return convergizabilityCapabilitiesResponseSchema.parse(await response.json())
}
