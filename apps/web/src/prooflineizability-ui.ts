import {
  prooflineizabilityAdminActionResponseSchema,
  prooflineizabilityAdminSummaryResponseSchema,
  prooflineizabilityCapabilitiesResponseSchema,
  prooflineizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchProoflineizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/prooflineizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return prooflineizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchProoflineizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/prooflineizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return prooflineizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeProoflineizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_prooflineizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/prooflineizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return prooflineizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatProoflineizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatProoflineizabilityRolloutCheckStatus(
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

export function formatProoflineizabilityAdminAction(action: 'refresh_prooflineizability_summary') {
  switch (action) {
    case 'refresh_prooflineizability_summary':
      return 'Refresh prooflineizability summary'
  }
}

export function formatProoflineizabilityDomain(
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

export async function fetchProoflineizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/prooflineizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return prooflineizabilityCapabilitiesResponseSchema.parse(await response.json())
}
