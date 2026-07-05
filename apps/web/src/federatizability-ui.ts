import {
  federatizabilityAdminActionResponseSchema,
  federatizabilityAdminSummaryResponseSchema,
  federatizabilityCapabilitiesResponseSchema,
  federatizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchFederatizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/federatizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return federatizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchFederatizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/federatizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return federatizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeFederatizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_federatizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/federatizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return federatizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatFederatizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatFederatizabilityRolloutCheckStatus(
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

export function formatFederatizabilityAdminAction(action: 'refresh_federatizability_summary') {
  switch (action) {
    case 'refresh_federatizability_summary':
      return 'Refresh federatizability summary'
  }
}

export function formatFederatizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_usage_limits' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_usage_limits':
      return 'Workspace usage limits'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchFederatizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/federatizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return federatizabilityCapabilitiesResponseSchema.parse(await response.json())
}
