import {
  ontologizabilityAdminActionResponseSchema,
  ontologizabilityAdminSummaryResponseSchema,
  ontologizabilityCapabilitiesResponseSchema,
  ontologizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchOntologizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/ontologizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return ontologizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchOntologizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/ontologizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return ontologizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeOntologizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_ontologizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/ontologizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return ontologizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatOntologizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatOntologizabilityRolloutCheckStatus(
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

export function formatOntologizabilityAdminAction(action: 'refresh_ontologizability_summary') {
  switch (action) {
    case 'refresh_ontologizability_summary':
      return 'Refresh ontologizability summary'
  }
}

export function formatOntologizabilityDomain(
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

export async function fetchOntologizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/ontologizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return ontologizabilityCapabilitiesResponseSchema.parse(await response.json())
}
