import {
  schedulabilityvaultizabilityAdminActionResponseSchema,
  schedulabilityvaultizabilityAdminSummaryResponseSchema,
  schedulabilityvaultizabilityCapabilitiesResponseSchema,
  schedulabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSchedulabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/schedulabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return schedulabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSchedulabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/schedulabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return schedulabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSchedulabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_schedulabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/schedulabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return schedulabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSchedulabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSchedulabilityvaultizabilityRolloutCheckStatus(
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

export function formatSchedulabilityvaultizabilityAdminAction(action: 'refresh_schedulabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_schedulabilityvaultizability_summary':
      return 'Refresh schedulabilityvaultizability summary'
  }
}

export function formatSchedulabilityvaultizabilityDomain(
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

export async function fetchSchedulabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/schedulabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return schedulabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
