import {
  responsivenessvaultizabilityAdminActionResponseSchema,
  responsivenessvaultizabilityAdminSummaryResponseSchema,
  responsivenessvaultizabilityCapabilitiesResponseSchema,
  responsivenessvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchResponsivenessvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/responsivenessvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return responsivenessvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchResponsivenessvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/responsivenessvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return responsivenessvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeResponsivenessvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_responsivenessvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/responsivenessvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return responsivenessvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatResponsivenessvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatResponsivenessvaultizabilityRolloutCheckStatus(
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

export function formatResponsivenessvaultizabilityAdminAction(action: 'refresh_responsivenessvaultizability_summary') {
  switch (action) {
    case 'refresh_responsivenessvaultizability_summary':
      return 'Refresh responsivenessvaultizability summary'
  }
}

export function formatResponsivenessvaultizabilityDomain(
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

export async function fetchResponsivenessvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/responsivenessvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return responsivenessvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
