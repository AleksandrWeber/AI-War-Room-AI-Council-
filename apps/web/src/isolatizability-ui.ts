import {
  isolatizabilityAdminActionResponseSchema,
  isolatizabilityAdminSummaryResponseSchema,
  isolatizabilityCapabilitiesResponseSchema,
  isolatizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchIsolatizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/isolatizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return isolatizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchIsolatizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/isolatizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return isolatizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeIsolatizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_isolatizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/isolatizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return isolatizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatIsolatizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatIsolatizabilityRolloutCheckStatus(
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

export function formatIsolatizabilityAdminAction(action: 'refresh_isolatizability_summary') {
  switch (action) {
    case 'refresh_isolatizability_summary':
      return 'Refresh isolatizability summary'
  }
}

export function formatIsolatizabilityDomain(
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

export async function fetchIsolatizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/isolatizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return isolatizabilityCapabilitiesResponseSchema.parse(await response.json())
}
