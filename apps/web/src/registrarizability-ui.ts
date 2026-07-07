import {
  registrarizabilityAdminActionResponseSchema,
  registrarizabilityAdminSummaryResponseSchema,
  registrarizabilityCapabilitiesResponseSchema,
  registrarizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRegistrarizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/registrarizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return registrarizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRegistrarizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/registrarizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return registrarizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRegistrarizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_registrarizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/registrarizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return registrarizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRegistrarizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRegistrarizabilityRolloutCheckStatus(
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

export function formatRegistrarizabilityAdminAction(action: 'refresh_registrarizability_summary') {
  switch (action) {
    case 'refresh_registrarizability_summary':
      return 'Refresh registrarizability summary'
  }
}

export function formatRegistrarizabilityDomain(
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

export async function fetchRegistrarizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/registrarizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return registrarizabilityCapabilitiesResponseSchema.parse(await response.json())
}
