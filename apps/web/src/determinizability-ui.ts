import {
  determinizabilityAdminActionResponseSchema,
  determinizabilityAdminSummaryResponseSchema,
  determinizabilityCapabilitiesResponseSchema,
  determinizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDeterminizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/determinizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return determinizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDeterminizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/determinizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return determinizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDeterminizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_determinizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/determinizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return determinizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDeterminizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDeterminizabilityRolloutCheckStatus(
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

export function formatDeterminizabilityAdminAction(action: 'refresh_determinizability_summary') {
  switch (action) {
    case 'refresh_determinizability_summary':
      return 'Refresh determinizability summary'
  }
}

export function formatDeterminizabilityDomain(
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

export async function fetchDeterminizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/determinizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return determinizabilityCapabilitiesResponseSchema.parse(await response.json())
}
