import {
  attestledgerizabilityAdminActionResponseSchema,
  attestledgerizabilityAdminSummaryResponseSchema,
  attestledgerizabilityCapabilitiesResponseSchema,
  attestledgerizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAttestledgerizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/attestledgerizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return attestledgerizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAttestledgerizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/attestledgerizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return attestledgerizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAttestledgerizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_attestledgerizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/attestledgerizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return attestledgerizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAttestledgerizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAttestledgerizabilityRolloutCheckStatus(
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

export function formatAttestledgerizabilityAdminAction(action: 'refresh_attestledgerizability_summary') {
  switch (action) {
    case 'refresh_attestledgerizability_summary':
      return 'Refresh attestledgerizability summary'
  }
}

export function formatAttestledgerizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_memberships' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_memberships':
      return 'Workspace memberships'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchAttestledgerizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/attestledgerizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return attestledgerizabilityCapabilitiesResponseSchema.parse(await response.json())
}
