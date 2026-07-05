import {
  handoffizabilityAdminActionResponseSchema,
  handoffizabilityAdminSummaryResponseSchema,
  handoffizabilityCapabilitiesResponseSchema,
  handoffizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchHandoffizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/handoffizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return handoffizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchHandoffizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/handoffizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return handoffizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeHandoffizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_handoffizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/handoffizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return handoffizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatHandoffizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatHandoffizabilityRolloutCheckStatus(
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

export function formatHandoffizabilityAdminAction(action: 'refresh_handoffizability_summary') {
  switch (action) {
    case 'refresh_handoffizability_summary':
      return 'Refresh handoffizability summary'
  }
}

export function formatHandoffizabilityDomain(
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

export async function fetchHandoffizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/handoffizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return handoffizabilityCapabilitiesResponseSchema.parse(await response.json())
}
