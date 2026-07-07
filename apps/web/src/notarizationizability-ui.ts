import {
  notarizationizabilityAdminActionResponseSchema,
  notarizationizabilityAdminSummaryResponseSchema,
  notarizationizabilityCapabilitiesResponseSchema,
  notarizationizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchNotarizationizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/notarizationizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return notarizationizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchNotarizationizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/notarizationizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return notarizationizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeNotarizationizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_notarizationizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/notarizationizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return notarizationizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatNotarizationizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatNotarizationizabilityRolloutCheckStatus(
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

export function formatNotarizationizabilityAdminAction(action: 'refresh_notarizationizability_summary') {
  switch (action) {
    case 'refresh_notarizationizability_summary':
      return 'Refresh notarizationizability summary'
  }
}

export function formatNotarizationizabilityDomain(
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

export async function fetchNotarizationizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/notarizationizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return notarizationizabilityCapabilitiesResponseSchema.parse(await response.json())
}
