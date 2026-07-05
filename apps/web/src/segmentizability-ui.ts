import {
  segmentizabilityAdminActionResponseSchema,
  segmentizabilityAdminSummaryResponseSchema,
  segmentizabilityCapabilitiesResponseSchema,
  segmentizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSegmentizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/segmentizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return segmentizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSegmentizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/segmentizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return segmentizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSegmentizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_segmentizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/segmentizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return segmentizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSegmentizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSegmentizabilityRolloutCheckStatus(
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

export function formatSegmentizabilityAdminAction(action: 'refresh_segmentizability_summary') {
  switch (action) {
    case 'refresh_segmentizability_summary':
      return 'Refresh segmentizability summary'
  }
}

export function formatSegmentizabilityDomain(
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

export async function fetchSegmentizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/segmentizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return segmentizabilityCapabilitiesResponseSchema.parse(await response.json())
}
