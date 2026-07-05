import {
  invalidationizabilityAdminActionResponseSchema,
  invalidationizabilityAdminSummaryResponseSchema,
  invalidationizabilityCapabilitiesResponseSchema,
  invalidationizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchInvalidationizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/invalidationizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return invalidationizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchInvalidationizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/invalidationizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return invalidationizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeInvalidationizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_invalidationizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/invalidationizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return invalidationizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatInvalidationizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatInvalidationizabilityRolloutCheckStatus(
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

export function formatInvalidationizabilityAdminAction(action: 'refresh_invalidationizability_summary') {
  switch (action) {
    case 'refresh_invalidationizability_summary':
      return 'Refresh invalidationizability summary'
  }
}

export function formatInvalidationizabilityDomain(
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

export async function fetchInvalidationizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/invalidationizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return invalidationizabilityCapabilitiesResponseSchema.parse(await response.json())
}
