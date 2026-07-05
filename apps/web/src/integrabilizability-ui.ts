import {
  integrabilizabilityAdminActionResponseSchema,
  integrabilizabilityAdminSummaryResponseSchema,
  integrabilizabilityCapabilitiesResponseSchema,
  integrabilizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchIntegrabilizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/integrabilizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return integrabilizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchIntegrabilizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/integrabilizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return integrabilizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeIntegrabilizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_integrabilizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/integrabilizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return integrabilizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatIntegrabilizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatIntegrabilizabilityRolloutCheckStatus(
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

export function formatIntegrabilizabilityAdminAction(action: 'refresh_integrabilizability_summary') {
  switch (action) {
    case 'refresh_integrabilizability_summary':
      return 'Refresh integrabilizability summary'
  }
}

export function formatIntegrabilizabilityDomain(
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

export async function fetchIntegrabilizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/integrabilizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return integrabilizabilityCapabilitiesResponseSchema.parse(await response.json())
}
