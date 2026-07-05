import {
  indexizabilityAdminActionResponseSchema,
  indexizabilityAdminSummaryResponseSchema,
  indexizabilityCapabilitiesResponseSchema,
  indexizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchIndexizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/indexizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return indexizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchIndexizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/indexizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return indexizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeIndexizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_indexizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/indexizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return indexizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatIndexizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatIndexizabilityRolloutCheckStatus(
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

export function formatIndexizabilityAdminAction(action: 'refresh_indexizability_summary') {
  switch (action) {
    case 'refresh_indexizability_summary':
      return 'Refresh indexizability summary'
  }
}

export function formatIndexizabilityDomain(
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

export async function fetchIndexizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/indexizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return indexizabilityCapabilitiesResponseSchema.parse(await response.json())
}
