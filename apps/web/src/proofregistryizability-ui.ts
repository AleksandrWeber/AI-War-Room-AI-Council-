import {
  proofregistryizabilityAdminActionResponseSchema,
  proofregistryizabilityAdminSummaryResponseSchema,
  proofregistryizabilityCapabilitiesResponseSchema,
  proofregistryizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchProofregistryizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/proofregistryizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return proofregistryizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchProofregistryizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/proofregistryizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return proofregistryizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeProofregistryizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_proofregistryizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/proofregistryizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return proofregistryizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatProofregistryizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatProofregistryizabilityRolloutCheckStatus(
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

export function formatProofregistryizabilityAdminAction(action: 'refresh_proofregistryizability_summary') {
  switch (action) {
    case 'refresh_proofregistryizability_summary':
      return 'Refresh proofregistryizability summary'
  }
}

export function formatProofregistryizabilityDomain(
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

export async function fetchProofregistryizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/proofregistryizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return proofregistryizabilityCapabilitiesResponseSchema.parse(await response.json())
}
