import {
  distinguishabilityAdminActionResponseSchema,
  distinguishabilityAdminSummaryResponseSchema,
  distinguishabilityCapabilitiesResponseSchema,
  distinguishabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDistinguishabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/distinguishability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return distinguishabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDistinguishabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/distinguishability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return distinguishabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDistinguishabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_distinguishability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/distinguishability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return distinguishabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDistinguishabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDistinguishabilityRolloutCheckStatus(
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

export function formatDistinguishabilityAdminAction(action: 'refresh_distinguishability_summary') {
  switch (action) {
    case 'refresh_distinguishability_summary':
      return 'Refresh distinguishability summary'
  }
}

export function formatDistinguishabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'moderator_syntheses' | 'run_workflows',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'moderator_syntheses':
      return 'Moderator syntheses'
    case 'run_workflows':
      return 'Run workflows'
  }
}

export async function fetchDistinguishabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/distinguishability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return distinguishabilityCapabilitiesResponseSchema.parse(await response.json())
}
