import {
  reliabilityAdminActionResponseSchema,
  reliabilityAdminSummaryResponseSchema,
  reliabilityCapabilitiesResponseSchema,
  reliabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchReliabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/reliability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return reliabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchReliabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/reliability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return reliabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeReliabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_reliability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/reliability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return reliabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatReliabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatReliabilityRolloutCheckStatus(
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

export function formatReliabilityAdminAction(
  action: 'refresh_reliability_summary',
) {
  switch (action) {
    case 'refresh_reliability_summary':
      return 'Refresh reliability summary'
  }
}

export function formatReliabilityDomain(
  domain:
    | 'completed_runs'
    | 'failed_runs'
    | 'idempotency_keys'
    | 'model_health_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'idempotency_keys':
      return 'Idempotency keys'
    case 'model_health_events':
      return 'Model health events'
  }
}

export async function fetchReliabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/reliability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return reliabilityCapabilitiesResponseSchema.parse(await response.json())
}
