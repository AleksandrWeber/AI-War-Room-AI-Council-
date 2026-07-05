import {
  dramatizabilityAdminActionResponseSchema,
  dramatizabilityAdminSummaryResponseSchema,
  dramatizabilityCapabilitiesResponseSchema,
  dramatizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDramatizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/dramatizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return dramatizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDramatizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/dramatizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return dramatizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDramatizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_dramatizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/dramatizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return dramatizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDramatizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDramatizabilityRolloutCheckStatus(
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

export function formatDramatizabilityAdminAction(action: 'refresh_dramatizability_summary') {
  switch (action) {
    case 'refresh_dramatizability_summary':
      return 'Refresh dramatizability summary'
  }
}

export function formatDramatizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'artifacts' | 'agent_outputs',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'artifacts':
      return 'Artifacts'
    case 'agent_outputs':
      return 'Agent outputs'
  }
}

export async function fetchDramatizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/dramatizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return dramatizabilityCapabilitiesResponseSchema.parse(await response.json())
}
