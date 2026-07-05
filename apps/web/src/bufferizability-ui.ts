import {
  bufferizabilityAdminActionResponseSchema,
  bufferizabilityAdminSummaryResponseSchema,
  bufferizabilityCapabilitiesResponseSchema,
  bufferizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchBufferizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/bufferizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return bufferizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchBufferizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/bufferizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return bufferizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeBufferizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_bufferizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/bufferizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return bufferizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatBufferizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatBufferizabilityRolloutCheckStatus(
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

export function formatBufferizabilityAdminAction(action: 'refresh_bufferizability_summary') {
  switch (action) {
    case 'refresh_bufferizability_summary':
      return 'Refresh bufferizability summary'
  }
}

export function formatBufferizabilityDomain(
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

export async function fetchBufferizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/bufferizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return bufferizabilityCapabilitiesResponseSchema.parse(await response.json())
}
