import {
  locatabilityvaultizabilityAdminActionResponseSchema,
  locatabilityvaultizabilityAdminSummaryResponseSchema,
  locatabilityvaultizabilityCapabilitiesResponseSchema,
  locatabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchLocatabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/locatabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return locatabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchLocatabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/locatabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return locatabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeLocatabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_locatabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/locatabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return locatabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatLocatabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatLocatabilityvaultizabilityRolloutCheckStatus(
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

export function formatLocatabilityvaultizabilityAdminAction(action: 'refresh_locatabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_locatabilityvaultizability_summary':
      return 'Refresh locatabilityvaultizability summary'
  }
}

export function formatLocatabilityvaultizabilityDomain(
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

export async function fetchLocatabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/locatabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return locatabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
