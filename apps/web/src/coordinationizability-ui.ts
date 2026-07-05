import {
  coordinationizabilityAdminActionResponseSchema,
  coordinationizabilityAdminSummaryResponseSchema,
  coordinationizabilityCapabilitiesResponseSchema,
  coordinationizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCoordinationizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/coordinationizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return coordinationizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCoordinationizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/coordinationizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return coordinationizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCoordinationizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_coordinationizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/coordinationizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return coordinationizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCoordinationizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCoordinationizabilityRolloutCheckStatus(
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

export function formatCoordinationizabilityAdminAction(action: 'refresh_coordinationizability_summary') {
  switch (action) {
    case 'refresh_coordinationizability_summary':
      return 'Refresh coordinationizability summary'
  }
}

export function formatCoordinationizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'idempotency_keys' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'idempotency_keys':
      return 'Idempotency keys'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchCoordinationizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/coordinationizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return coordinationizabilityCapabilitiesResponseSchema.parse(await response.json())
}
