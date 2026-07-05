import {
  releaseAdminActionResponseSchema,
  releaseAdminSummaryResponseSchema,
  releaseCapabilitiesResponseSchema,
  releaseRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchReleaseRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/releases/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return releaseRolloutResponseSchema.parse(await response.json())
}

export async function fetchReleaseAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/releases/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return releaseAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeReleaseAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_release_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/releases/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return releaseAdminActionResponseSchema.parse(await response.json())
}

export function formatReleaseRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatReleaseRolloutCheckStatus(
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

export function formatReleaseAdminAction(action: 'refresh_release_summary') {
  switch (action) {
    case 'refresh_release_summary':
      return 'Refresh release summary'
  }
}

export function formatReleaseDomain(
  domain: 'completed_runs' | 'artifacts' | 'run_workflows' | 'agent_outputs',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'artifacts':
      return 'Artifacts'
    case 'run_workflows':
      return 'Run workflows'
    case 'agent_outputs':
      return 'Agent outputs'
  }
}

export async function fetchReleaseCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/releases/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return releaseCapabilitiesResponseSchema.parse(await response.json())
}
