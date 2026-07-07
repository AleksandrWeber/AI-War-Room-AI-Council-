import {
  linkabilityvaultizabilityAdminActionResponseSchema,
  linkabilityvaultizabilityAdminSummaryResponseSchema,
  linkabilityvaultizabilityCapabilitiesResponseSchema,
  linkabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchLinkabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/linkabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return linkabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchLinkabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/linkabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return linkabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeLinkabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_linkabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/linkabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return linkabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatLinkabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatLinkabilityvaultizabilityRolloutCheckStatus(
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

export function formatLinkabilityvaultizabilityAdminAction(action: 'refresh_linkabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_linkabilityvaultizability_summary':
      return 'Refresh linkabilityvaultizability summary'
  }
}

export function formatLinkabilityvaultizabilityDomain(
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

export async function fetchLinkabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/linkabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return linkabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
