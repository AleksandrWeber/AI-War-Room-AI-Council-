import {
  chainofcustodyizabilityAdminActionResponseSchema,
  chainofcustodyizabilityAdminSummaryResponseSchema,
  chainofcustodyizabilityCapabilitiesResponseSchema,
  chainofcustodyizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchChainofcustodyizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/chainofcustodyizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return chainofcustodyizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchChainofcustodyizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/chainofcustodyizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return chainofcustodyizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeChainofcustodyizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_chainofcustodyizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/chainofcustodyizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return chainofcustodyizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatChainofcustodyizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatChainofcustodyizabilityRolloutCheckStatus(
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

export function formatChainofcustodyizabilityAdminAction(action: 'refresh_chainofcustodyizability_summary') {
  switch (action) {
    case 'refresh_chainofcustodyizability_summary':
      return 'Refresh chainofcustodyizability summary'
  }
}

export function formatChainofcustodyizabilityDomain(
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

export async function fetchChainofcustodyizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/chainofcustodyizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return chainofcustodyizabilityCapabilitiesResponseSchema.parse(await response.json())
}
