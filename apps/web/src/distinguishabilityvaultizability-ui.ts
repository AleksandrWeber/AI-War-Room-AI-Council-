import {
  distinguishabilityvaultizabilityAdminActionResponseSchema,
  distinguishabilityvaultizabilityAdminSummaryResponseSchema,
  distinguishabilityvaultizabilityCapabilitiesResponseSchema,
  distinguishabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDistinguishabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/distinguishabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return distinguishabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDistinguishabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/distinguishabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return distinguishabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDistinguishabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_distinguishabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/distinguishabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return distinguishabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDistinguishabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDistinguishabilityvaultizabilityRolloutCheckStatus(
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

export function formatDistinguishabilityvaultizabilityAdminAction(action: 'refresh_distinguishabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_distinguishabilityvaultizability_summary':
      return 'Refresh distinguishabilityvaultizability summary'
  }
}

export function formatDistinguishabilityvaultizabilityDomain(
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

export async function fetchDistinguishabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/distinguishabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return distinguishabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
