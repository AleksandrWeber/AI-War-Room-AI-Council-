import {
  modularizabilityAdminActionResponseSchema,
  modularizabilityAdminSummaryResponseSchema,
  modularizabilityCapabilitiesResponseSchema,
  modularizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchModularizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/modularizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return modularizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchModularizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/modularizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return modularizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeModularizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_modularizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/modularizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return modularizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatModularizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatModularizabilityRolloutCheckStatus(
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

export function formatModularizabilityAdminAction(action: 'refresh_modularizability_summary') {
  switch (action) {
    case 'refresh_modularizability_summary':
      return 'Refresh modularizability summary'
  }
}

export function formatModularizabilityDomain(
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

export async function fetchModularizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/modularizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return modularizabilityCapabilitiesResponseSchema.parse(await response.json())
}
