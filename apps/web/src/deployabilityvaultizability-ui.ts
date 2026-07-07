import {
  deployabilityvaultizabilityAdminActionResponseSchema,
  deployabilityvaultizabilityAdminSummaryResponseSchema,
  deployabilityvaultizabilityCapabilitiesResponseSchema,
  deployabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDeployabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/deployabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deployabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDeployabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/deployabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deployabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDeployabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_deployabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/deployabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return deployabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDeployabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDeployabilityvaultizabilityRolloutCheckStatus(
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

export function formatDeployabilityvaultizabilityAdminAction(action: 'refresh_deployabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_deployabilityvaultizability_summary':
      return 'Refresh deployabilityvaultizability summary'
  }
}

export function formatDeployabilityvaultizabilityDomain(
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

export async function fetchDeployabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/deployabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deployabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
