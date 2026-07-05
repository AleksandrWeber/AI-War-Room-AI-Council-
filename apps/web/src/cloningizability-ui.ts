import {
  cloningizabilityAdminActionResponseSchema,
  cloningizabilityAdminSummaryResponseSchema,
  cloningizabilityCapabilitiesResponseSchema,
  cloningizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCloningizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/cloningizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return cloningizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCloningizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/cloningizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return cloningizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCloningizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_cloningizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/cloningizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return cloningizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCloningizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCloningizabilityRolloutCheckStatus(
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

export function formatCloningizabilityAdminAction(action: 'refresh_cloningizability_summary') {
  switch (action) {
    case 'refresh_cloningizability_summary':
      return 'Refresh cloningizability summary'
  }
}

export function formatCloningizabilityDomain(
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

export async function fetchCloningizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/cloningizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return cloningizabilityCapabilitiesResponseSchema.parse(await response.json())
}
