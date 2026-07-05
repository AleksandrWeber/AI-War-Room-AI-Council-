import {
  methodizabilityAdminActionResponseSchema,
  methodizabilityAdminSummaryResponseSchema,
  methodizabilityCapabilitiesResponseSchema,
  methodizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchMethodizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/methodizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return methodizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchMethodizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/methodizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return methodizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeMethodizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_methodizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/methodizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return methodizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatMethodizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatMethodizabilityRolloutCheckStatus(
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

export function formatMethodizabilityAdminAction(action: 'refresh_methodizability_summary') {
  switch (action) {
    case 'refresh_methodizability_summary':
      return 'Refresh methodizability summary'
  }
}

export function formatMethodizabilityDomain(
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

export async function fetchMethodizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/methodizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return methodizabilityCapabilitiesResponseSchema.parse(await response.json())
}
