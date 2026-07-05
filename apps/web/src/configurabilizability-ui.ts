import {
  configurabilizabilityAdminActionResponseSchema,
  configurabilizabilityAdminSummaryResponseSchema,
  configurabilizabilityCapabilitiesResponseSchema,
  configurabilizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchConfigurabilizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/configurabilizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return configurabilizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchConfigurabilizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/configurabilizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return configurabilizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeConfigurabilizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_configurabilizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/configurabilizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return configurabilizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatConfigurabilizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatConfigurabilizabilityRolloutCheckStatus(
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

export function formatConfigurabilizabilityAdminAction(action: 'refresh_configurabilizability_summary') {
  switch (action) {
    case 'refresh_configurabilizability_summary':
      return 'Refresh configurabilizability summary'
  }
}

export function formatConfigurabilizabilityDomain(
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

export async function fetchConfigurabilizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/configurabilizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return configurabilizabilityCapabilitiesResponseSchema.parse(await response.json())
}
