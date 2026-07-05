import {
  memorabilityAdminActionResponseSchema,
  memorabilityAdminSummaryResponseSchema,
  memorabilityCapabilitiesResponseSchema,
  memorabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchMemorabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/memorability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return memorabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchMemorabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/memorability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return memorabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeMemorabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_memorability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/memorability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return memorabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatMemorabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatMemorabilityRolloutCheckStatus(
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

export function formatMemorabilityAdminAction(action: 'refresh_memorability_summary') {
  switch (action) {
    case 'refresh_memorability_summary':
      return 'Refresh memorability summary'
  }
}

export function formatMemorabilityDomain(
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

export async function fetchMemorabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/memorability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return memorabilityCapabilitiesResponseSchema.parse(await response.json())
}
