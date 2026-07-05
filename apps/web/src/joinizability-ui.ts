import {
  joinizabilityAdminActionResponseSchema,
  joinizabilityAdminSummaryResponseSchema,
  joinizabilityCapabilitiesResponseSchema,
  joinizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchJoinizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/joinizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return joinizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchJoinizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/joinizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return joinizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeJoinizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_joinizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/joinizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return joinizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatJoinizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatJoinizabilityRolloutCheckStatus(
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

export function formatJoinizabilityAdminAction(action: 'refresh_joinizability_summary') {
  switch (action) {
    case 'refresh_joinizability_summary':
      return 'Refresh joinizability summary'
  }
}

export function formatJoinizabilityDomain(
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

export async function fetchJoinizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/joinizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return joinizabilityCapabilitiesResponseSchema.parse(await response.json())
}
