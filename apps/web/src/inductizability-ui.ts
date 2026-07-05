import {
  inductizabilityAdminActionResponseSchema,
  inductizabilityAdminSummaryResponseSchema,
  inductizabilityCapabilitiesResponseSchema,
  inductizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchInductizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/inductizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return inductizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchInductizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/inductizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return inductizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeInductizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_inductizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/inductizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return inductizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatInductizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatInductizabilityRolloutCheckStatus(
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

export function formatInductizabilityAdminAction(action: 'refresh_inductizability_summary') {
  switch (action) {
    case 'refresh_inductizability_summary':
      return 'Refresh inductizability summary'
  }
}

export function formatInductizabilityDomain(
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

export async function fetchInductizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/inductizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return inductizabilityCapabilitiesResponseSchema.parse(await response.json())
}
