import {
  trustworthinessAdminActionResponseSchema,
  trustworthinessAdminSummaryResponseSchema,
  trustworthinessCapabilitiesResponseSchema,
  trustworthinessRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTrustworthinessRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/trustworthiness/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return trustworthinessRolloutResponseSchema.parse(await response.json())
}

export async function fetchTrustworthinessAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/trustworthiness/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return trustworthinessAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTrustworthinessAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_trustworthiness_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/trustworthiness/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return trustworthinessAdminActionResponseSchema.parse(await response.json())
}

export function formatTrustworthinessRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTrustworthinessRolloutCheckStatus(
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

export function formatTrustworthinessAdminAction(action: 'refresh_trustworthiness_summary') {
  switch (action) {
    case 'refresh_trustworthiness_summary':
      return 'Refresh trustworthiness summary'
  }
}

export function formatTrustworthinessDomain(
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

export async function fetchTrustworthinessCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/trustworthiness/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return trustworthinessCapabilitiesResponseSchema.parse(await response.json())
}
