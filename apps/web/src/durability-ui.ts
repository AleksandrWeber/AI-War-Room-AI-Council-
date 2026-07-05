import {
  durabilityAdminActionResponseSchema,
  durabilityAdminSummaryResponseSchema,
  durabilityCapabilitiesResponseSchema,
  durabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDurabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/durability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return durabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDurabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/durability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return durabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDurabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_durability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/durability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return durabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDurabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDurabilityRolloutCheckStatus(
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

export function formatDurabilityAdminAction(
  action: 'refresh_durability_summary',
) {
  switch (action) {
    case 'refresh_durability_summary':
      return 'Refresh durability summary'
  }
}

export function formatDurabilityDomain(
  domain:
    | 'completed_runs'
    | 'artifacts'
    | 'usage_events'
    | 'idempotency_keys',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'artifacts':
      return 'Artifacts'
    case 'usage_events':
      return 'Usage events'
    case 'idempotency_keys':
      return 'Idempotency keys'
  }
}

export async function fetchDurabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/durability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return durabilityCapabilitiesResponseSchema.parse(await response.json())
}
