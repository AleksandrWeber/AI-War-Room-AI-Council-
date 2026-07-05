import {
  linkabilityAdminActionResponseSchema,
  linkabilityAdminSummaryResponseSchema,
  linkabilityCapabilitiesResponseSchema,
  linkabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchLinkabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/linkability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return linkabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchLinkabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/linkability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return linkabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeLinkabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_linkability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/linkability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return linkabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatLinkabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatLinkabilityRolloutCheckStatus(
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

export function formatLinkabilityAdminAction(action: 'refresh_linkability_summary') {
  switch (action) {
    case 'refresh_linkability_summary':
      return 'Refresh linkability summary'
  }
}

export function formatLinkabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'run_workflows' | 'artifacts',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'run_workflows':
      return 'Run workflows'
    case 'artifacts':
      return 'Artifacts'
  }
}

export async function fetchLinkabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/linkability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return linkabilityCapabilitiesResponseSchema.parse(await response.json())
}
