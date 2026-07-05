import {
  standardizabilityAdminActionResponseSchema,
  standardizabilityAdminSummaryResponseSchema,
  standardizabilityCapabilitiesResponseSchema,
  standardizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchStandardizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/standardizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return standardizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchStandardizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/standardizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return standardizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeStandardizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_standardizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/standardizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return standardizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatStandardizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatStandardizabilityRolloutCheckStatus(
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

export function formatStandardizabilityAdminAction(action: 'refresh_standardizability_summary') {
  switch (action) {
    case 'refresh_standardizability_summary':
      return 'Refresh standardizability summary'
  }
}

export function formatStandardizabilityDomain(
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

export async function fetchStandardizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/standardizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return standardizabilityCapabilitiesResponseSchema.parse(await response.json())
}
