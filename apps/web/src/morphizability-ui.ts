import {
  morphizabilityAdminActionResponseSchema,
  morphizabilityAdminSummaryResponseSchema,
  morphizabilityCapabilitiesResponseSchema,
  morphizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchMorphizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/morphizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return morphizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchMorphizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/morphizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return morphizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeMorphizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_morphizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/morphizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return morphizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatMorphizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatMorphizabilityRolloutCheckStatus(
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

export function formatMorphizabilityAdminAction(action: 'refresh_morphizability_summary') {
  switch (action) {
    case 'refresh_morphizability_summary':
      return 'Refresh morphizability summary'
  }
}

export function formatMorphizabilityDomain(
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

export async function fetchMorphizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/morphizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return morphizabilityCapabilitiesResponseSchema.parse(await response.json())
}
