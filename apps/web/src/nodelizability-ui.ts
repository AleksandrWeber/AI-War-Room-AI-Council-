import {
  nodelizabilityAdminActionResponseSchema,
  nodelizabilityAdminSummaryResponseSchema,
  nodelizabilityCapabilitiesResponseSchema,
  nodelizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchNodelizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/nodelizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return nodelizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchNodelizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/nodelizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return nodelizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeNodelizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_nodelizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/nodelizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return nodelizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatNodelizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatNodelizabilityRolloutCheckStatus(
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

export function formatNodelizabilityAdminAction(action: 'refresh_nodelizability_summary') {
  switch (action) {
    case 'refresh_nodelizability_summary':
      return 'Refresh nodelizability summary'
  }
}

export function formatNodelizabilityDomain(
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

export async function fetchNodelizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/nodelizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return nodelizabilityCapabilitiesResponseSchema.parse(await response.json())
}
