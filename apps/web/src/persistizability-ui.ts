import {
  persistizabilityAdminActionResponseSchema,
  persistizabilityAdminSummaryResponseSchema,
  persistizabilityCapabilitiesResponseSchema,
  persistizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchPersistizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/persistizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return persistizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchPersistizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/persistizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return persistizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executePersistizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_persistizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/persistizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return persistizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatPersistizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatPersistizabilityRolloutCheckStatus(
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

export function formatPersistizabilityAdminAction(action: 'refresh_persistizability_summary') {
  switch (action) {
    case 'refresh_persistizability_summary':
      return 'Refresh persistizability summary'
  }
}

export function formatPersistizabilityDomain(
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

export async function fetchPersistizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/persistizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return persistizabilityCapabilitiesResponseSchema.parse(await response.json())
}
