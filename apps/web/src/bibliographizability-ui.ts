import {
  bibliographizabilityAdminActionResponseSchema,
  bibliographizabilityAdminSummaryResponseSchema,
  bibliographizabilityCapabilitiesResponseSchema,
  bibliographizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchBibliographizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/bibliographizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return bibliographizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchBibliographizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/bibliographizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return bibliographizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeBibliographizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_bibliographizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/bibliographizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return bibliographizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatBibliographizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatBibliographizabilityRolloutCheckStatus(
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

export function formatBibliographizabilityAdminAction(action: 'refresh_bibliographizability_summary') {
  switch (action) {
    case 'refresh_bibliographizability_summary':
      return 'Refresh bibliographizability summary'
  }
}

export function formatBibliographizabilityDomain(
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

export async function fetchBibliographizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/bibliographizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return bibliographizabilityCapabilitiesResponseSchema.parse(await response.json())
}
