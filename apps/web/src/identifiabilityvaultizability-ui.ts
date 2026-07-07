import {
  identifiabilityvaultizabilityAdminActionResponseSchema,
  identifiabilityvaultizabilityAdminSummaryResponseSchema,
  identifiabilityvaultizabilityCapabilitiesResponseSchema,
  identifiabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchIdentifiabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/identifiabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return identifiabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchIdentifiabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/identifiabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return identifiabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeIdentifiabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_identifiabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/identifiabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return identifiabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatIdentifiabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatIdentifiabilityvaultizabilityRolloutCheckStatus(
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

export function formatIdentifiabilityvaultizabilityAdminAction(action: 'refresh_identifiabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_identifiabilityvaultizability_summary':
      return 'Refresh identifiabilityvaultizability summary'
  }
}

export function formatIdentifiabilityvaultizabilityDomain(
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

export async function fetchIdentifiabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/identifiabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return identifiabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
