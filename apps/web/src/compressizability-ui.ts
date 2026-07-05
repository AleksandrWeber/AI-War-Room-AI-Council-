import {
  compressizabilityAdminActionResponseSchema,
  compressizabilityAdminSummaryResponseSchema,
  compressizabilityCapabilitiesResponseSchema,
  compressizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCompressizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/compressizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return compressizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCompressizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/compressizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return compressizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCompressizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_compressizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/compressizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return compressizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCompressizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCompressizabilityRolloutCheckStatus(
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

export function formatCompressizabilityAdminAction(action: 'refresh_compressizability_summary') {
  switch (action) {
    case 'refresh_compressizability_summary':
      return 'Refresh compressizability summary'
  }
}

export function formatCompressizabilityDomain(
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

export async function fetchCompressizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/compressizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return compressizabilityCapabilitiesResponseSchema.parse(await response.json())
}
