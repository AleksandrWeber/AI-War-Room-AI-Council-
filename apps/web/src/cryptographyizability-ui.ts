import {
  cryptographyizabilityAdminActionResponseSchema,
  cryptographyizabilityAdminSummaryResponseSchema,
  cryptographyizabilityCapabilitiesResponseSchema,
  cryptographyizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCryptographyizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/cryptographyizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return cryptographyizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCryptographyizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/cryptographyizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return cryptographyizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCryptographyizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_cryptographyizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/cryptographyizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return cryptographyizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCryptographyizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCryptographyizabilityRolloutCheckStatus(
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

export function formatCryptographyizabilityAdminAction(action: 'refresh_cryptographyizability_summary') {
  switch (action) {
    case 'refresh_cryptographyizability_summary':
      return 'Refresh cryptographyizability summary'
  }
}

export function formatCryptographyizabilityDomain(
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

export async function fetchCryptographyizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/cryptographyizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return cryptographyizabilityCapabilitiesResponseSchema.parse(await response.json())
}
