import {
  semiotizabilityAdminActionResponseSchema,
  semiotizabilityAdminSummaryResponseSchema,
  semiotizabilityCapabilitiesResponseSchema,
  semiotizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSemiotizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/semiotizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return semiotizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSemiotizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/semiotizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return semiotizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSemiotizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_semiotizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/semiotizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return semiotizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSemiotizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSemiotizabilityRolloutCheckStatus(
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

export function formatSemiotizabilityAdminAction(action: 'refresh_semiotizability_summary') {
  switch (action) {
    case 'refresh_semiotizability_summary':
      return 'Refresh semiotizability summary'
  }
}

export function formatSemiotizabilityDomain(
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

export async function fetchSemiotizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/semiotizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return semiotizabilityCapabilitiesResponseSchema.parse(await response.json())
}
