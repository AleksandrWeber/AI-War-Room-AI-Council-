import {
  hydrationizabilityAdminActionResponseSchema,
  hydrationizabilityAdminSummaryResponseSchema,
  hydrationizabilityCapabilitiesResponseSchema,
  hydrationizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchHydrationizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/hydrationizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return hydrationizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchHydrationizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/hydrationizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return hydrationizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeHydrationizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_hydrationizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/hydrationizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return hydrationizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatHydrationizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatHydrationizabilityRolloutCheckStatus(
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

export function formatHydrationizabilityAdminAction(action: 'refresh_hydrationizability_summary') {
  switch (action) {
    case 'refresh_hydrationizability_summary':
      return 'Refresh hydrationizability summary'
  }
}

export function formatHydrationizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'shield_scans' | 'workspace_provider_credentials',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'shield_scans':
      return 'Shield scans'
    case 'workspace_provider_credentials':
      return 'Provider credentials'
  }
}

export async function fetchHydrationizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/hydrationizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return hydrationizabilityCapabilitiesResponseSchema.parse(await response.json())
}
