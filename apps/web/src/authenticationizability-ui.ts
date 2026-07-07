import {
  authenticationizabilityAdminActionResponseSchema,
  authenticationizabilityAdminSummaryResponseSchema,
  authenticationizabilityCapabilitiesResponseSchema,
  authenticationizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAuthenticationizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/authenticationizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return authenticationizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAuthenticationizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/authenticationizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return authenticationizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAuthenticationizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_authenticationizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/authenticationizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return authenticationizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAuthenticationizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAuthenticationizabilityRolloutCheckStatus(
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

export function formatAuthenticationizabilityAdminAction(action: 'refresh_authenticationizability_summary') {
  switch (action) {
    case 'refresh_authenticationizability_summary':
      return 'Refresh authenticationizability summary'
  }
}

export function formatAuthenticationizabilityDomain(
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

export async function fetchAuthenticationizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/authenticationizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return authenticationizabilityCapabilitiesResponseSchema.parse(await response.json())
}
