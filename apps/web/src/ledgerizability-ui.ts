import {
  ledgerizabilityAdminActionResponseSchema,
  ledgerizabilityAdminSummaryResponseSchema,
  ledgerizabilityCapabilitiesResponseSchema,
  ledgerizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchLedgerizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/ledgerizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return ledgerizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchLedgerizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/ledgerizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return ledgerizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeLedgerizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_ledgerizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/ledgerizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return ledgerizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatLedgerizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatLedgerizabilityRolloutCheckStatus(
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

export function formatLedgerizabilityAdminAction(action: 'refresh_ledgerizability_summary') {
  switch (action) {
    case 'refresh_ledgerizability_summary':
      return 'Refresh ledgerizability summary'
  }
}

export function formatLedgerizabilityDomain(
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

export async function fetchLedgerizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/ledgerizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return ledgerizabilityCapabilitiesResponseSchema.parse(await response.json())
}
