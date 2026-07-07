import {
  oversightizabilityAdminActionResponseSchema,
  oversightizabilityAdminSummaryResponseSchema,
  oversightizabilityCapabilitiesResponseSchema,
  oversightizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchOversightizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/oversightizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return oversightizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchOversightizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/oversightizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return oversightizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeOversightizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_oversightizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/oversightizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return oversightizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatOversightizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatOversightizabilityRolloutCheckStatus(
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

export function formatOversightizabilityAdminAction(action: 'refresh_oversightizability_summary') {
  switch (action) {
    case 'refresh_oversightizability_summary':
      return 'Refresh oversightizability summary'
  }
}

export function formatOversightizabilityDomain(
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

export async function fetchOversightizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/oversightizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return oversightizabilityCapabilitiesResponseSchema.parse(await response.json())
}
