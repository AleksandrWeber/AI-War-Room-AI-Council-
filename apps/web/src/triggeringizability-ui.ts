import {
  triggeringizabilityAdminActionResponseSchema,
  triggeringizabilityAdminSummaryResponseSchema,
  triggeringizabilityCapabilitiesResponseSchema,
  triggeringizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTriggeringizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/triggeringizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return triggeringizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchTriggeringizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/triggeringizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return triggeringizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTriggeringizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_triggeringizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/triggeringizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return triggeringizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatTriggeringizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTriggeringizabilityRolloutCheckStatus(
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

export function formatTriggeringizabilityAdminAction(action: 'refresh_triggeringizability_summary') {
  switch (action) {
    case 'refresh_triggeringizability_summary':
      return 'Refresh triggeringizability summary'
  }
}

export function formatTriggeringizabilityDomain(
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

export async function fetchTriggeringizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/triggeringizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return triggeringizabilityCapabilitiesResponseSchema.parse(await response.json())
}
