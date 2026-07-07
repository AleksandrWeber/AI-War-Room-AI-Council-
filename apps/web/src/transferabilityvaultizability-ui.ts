import {
  transferabilityvaultizabilityAdminActionResponseSchema,
  transferabilityvaultizabilityAdminSummaryResponseSchema,
  transferabilityvaultizabilityCapabilitiesResponseSchema,
  transferabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTransferabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/transferabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return transferabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchTransferabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/transferabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return transferabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTransferabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_transferabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/transferabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return transferabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatTransferabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTransferabilityvaultizabilityRolloutCheckStatus(
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

export function formatTransferabilityvaultizabilityAdminAction(action: 'refresh_transferabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_transferabilityvaultizability_summary':
      return 'Refresh transferabilityvaultizability summary'
  }
}

export function formatTransferabilityvaultizabilityDomain(
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

export async function fetchTransferabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/transferabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return transferabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
