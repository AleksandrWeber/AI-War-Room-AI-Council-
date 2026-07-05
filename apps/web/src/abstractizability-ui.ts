import {
  abstractizabilityAdminActionResponseSchema,
  abstractizabilityAdminSummaryResponseSchema,
  abstractizabilityCapabilitiesResponseSchema,
  abstractizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAbstractizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/abstractizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return abstractizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAbstractizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/abstractizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return abstractizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAbstractizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_abstractizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/abstractizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return abstractizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAbstractizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAbstractizabilityRolloutCheckStatus(
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

export function formatAbstractizabilityAdminAction(action: 'refresh_abstractizability_summary') {
  switch (action) {
    case 'refresh_abstractizability_summary':
      return 'Refresh abstractizability summary'
  }
}

export function formatAbstractizabilityDomain(
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

export async function fetchAbstractizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/abstractizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return abstractizabilityCapabilitiesResponseSchema.parse(await response.json())
}
