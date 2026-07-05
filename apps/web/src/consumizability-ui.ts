import {
  consumizabilityAdminActionResponseSchema,
  consumizabilityAdminSummaryResponseSchema,
  consumizabilityCapabilitiesResponseSchema,
  consumizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchConsumizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/consumizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return consumizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchConsumizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/consumizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return consumizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeConsumizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_consumizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/consumizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return consumizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatConsumizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatConsumizabilityRolloutCheckStatus(
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

export function formatConsumizabilityAdminAction(action: 'refresh_consumizability_summary') {
  switch (action) {
    case 'refresh_consumizability_summary':
      return 'Refresh consumizability summary'
  }
}

export function formatConsumizabilityDomain(
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

export async function fetchConsumizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/consumizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return consumizabilityCapabilitiesResponseSchema.parse(await response.json())
}
