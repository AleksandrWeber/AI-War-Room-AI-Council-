import {
  groupizabilityAdminActionResponseSchema,
  groupizabilityAdminSummaryResponseSchema,
  groupizabilityCapabilitiesResponseSchema,
  groupizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchGroupizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/groupizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return groupizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchGroupizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/groupizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return groupizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeGroupizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_groupizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/groupizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return groupizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatGroupizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatGroupizabilityRolloutCheckStatus(
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

export function formatGroupizabilityAdminAction(action: 'refresh_groupizability_summary') {
  switch (action) {
    case 'refresh_groupizability_summary':
      return 'Refresh groupizability summary'
  }
}

export function formatGroupizabilityDomain(
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

export async function fetchGroupizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/groupizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return groupizabilityCapabilitiesResponseSchema.parse(await response.json())
}
