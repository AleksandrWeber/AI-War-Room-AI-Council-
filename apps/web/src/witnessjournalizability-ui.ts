import {
  witnessjournalizabilityAdminActionResponseSchema,
  witnessjournalizabilityAdminSummaryResponseSchema,
  witnessjournalizabilityCapabilitiesResponseSchema,
  witnessjournalizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchWitnessjournalizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/witnessjournalizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return witnessjournalizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchWitnessjournalizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/witnessjournalizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return witnessjournalizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeWitnessjournalizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_witnessjournalizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/witnessjournalizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return witnessjournalizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatWitnessjournalizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatWitnessjournalizabilityRolloutCheckStatus(
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

export function formatWitnessjournalizabilityAdminAction(action: 'refresh_witnessjournalizability_summary') {
  switch (action) {
    case 'refresh_witnessjournalizability_summary':
      return 'Refresh witnessjournalizability summary'
  }
}

export function formatWitnessjournalizabilityDomain(
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

export async function fetchWitnessjournalizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/witnessjournalizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return witnessjournalizabilityCapabilitiesResponseSchema.parse(await response.json())
}
