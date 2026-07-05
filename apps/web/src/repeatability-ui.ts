import {
  repeatabilityAdminActionResponseSchema,
  repeatabilityAdminSummaryResponseSchema,
  repeatabilityCapabilitiesResponseSchema,
  repeatabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRepeatabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/repeatability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return repeatabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRepeatabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/repeatability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return repeatabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRepeatabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_repeatability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/repeatability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return repeatabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRepeatabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRepeatabilityRolloutCheckStatus(
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

export function formatRepeatabilityAdminAction(action: 'refresh_repeatability_summary') {
  switch (action) {
    case 'refresh_repeatability_summary':
      return 'Refresh repeatability summary'
  }
}

export function formatRepeatabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'artifacts' | 'run_workflows',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'artifacts':
      return 'Artifacts'
    case 'run_workflows':
      return 'Run workflows'
  }
}

export async function fetchRepeatabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/repeatability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return repeatabilityCapabilitiesResponseSchema.parse(await response.json())
}
