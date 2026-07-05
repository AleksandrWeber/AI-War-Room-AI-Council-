import {
  encapsulizabilityAdminActionResponseSchema,
  encapsulizabilityAdminSummaryResponseSchema,
  encapsulizabilityCapabilitiesResponseSchema,
  encapsulizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchEncapsulizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/encapsulizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return encapsulizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchEncapsulizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/encapsulizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return encapsulizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeEncapsulizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_encapsulizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/encapsulizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return encapsulizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatEncapsulizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatEncapsulizabilityRolloutCheckStatus(
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

export function formatEncapsulizabilityAdminAction(action: 'refresh_encapsulizability_summary') {
  switch (action) {
    case 'refresh_encapsulizability_summary':
      return 'Refresh encapsulizability summary'
  }
}

export function formatEncapsulizabilityDomain(
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

export async function fetchEncapsulizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/encapsulizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return encapsulizabilityCapabilitiesResponseSchema.parse(await response.json())
}
