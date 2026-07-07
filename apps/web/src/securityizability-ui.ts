import {
  securityizabilityAdminActionResponseSchema,
  securityizabilityAdminSummaryResponseSchema,
  securityizabilityCapabilitiesResponseSchema,
  securityizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSecurityizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/securityizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return securityizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSecurityizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/securityizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return securityizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSecurityizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_securityizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/securityizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return securityizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSecurityizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSecurityizabilityRolloutCheckStatus(
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

export function formatSecurityizabilityAdminAction(action: 'refresh_securityizability_summary') {
  switch (action) {
    case 'refresh_securityizability_summary':
      return 'Refresh securityizability summary'
  }
}

export function formatSecurityizabilityDomain(
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

export async function fetchSecurityizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/securityizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return securityizabilityCapabilitiesResponseSchema.parse(await response.json())
}
