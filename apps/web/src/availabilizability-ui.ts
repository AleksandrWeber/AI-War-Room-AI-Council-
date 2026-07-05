import {
  availabilizabilityAdminActionResponseSchema,
  availabilizabilityAdminSummaryResponseSchema,
  availabilizabilityCapabilitiesResponseSchema,
  availabilizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAvailabilizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/availabilizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return availabilizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAvailabilizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/availabilizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return availabilizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAvailabilizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_availabilizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/availabilizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return availabilizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAvailabilizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAvailabilizabilityRolloutCheckStatus(
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

export function formatAvailabilizabilityAdminAction(action: 'refresh_availabilizability_summary') {
  switch (action) {
    case 'refresh_availabilizability_summary':
      return 'Refresh availabilizability summary'
  }
}

export function formatAvailabilizabilityDomain(
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

export async function fetchAvailabilizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/availabilizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return availabilizabilityCapabilitiesResponseSchema.parse(await response.json())
}
