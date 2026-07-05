import {
  quorumizabilityAdminActionResponseSchema,
  quorumizabilityAdminSummaryResponseSchema,
  quorumizabilityCapabilitiesResponseSchema,
  quorumizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchQuorumizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/quorumizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return quorumizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchQuorumizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/quorumizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return quorumizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeQuorumizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_quorumizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/quorumizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return quorumizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatQuorumizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatQuorumizabilityRolloutCheckStatus(
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

export function formatQuorumizabilityAdminAction(action: 'refresh_quorumizability_summary') {
  switch (action) {
    case 'refresh_quorumizability_summary':
      return 'Refresh quorumizability summary'
  }
}

export function formatQuorumizabilityDomain(
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

export async function fetchQuorumizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/quorumizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return quorumizabilityCapabilitiesResponseSchema.parse(await response.json())
}
