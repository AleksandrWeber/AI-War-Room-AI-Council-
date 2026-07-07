import {
  witnessledgerizabilityAdminActionResponseSchema,
  witnessledgerizabilityAdminSummaryResponseSchema,
  witnessledgerizabilityCapabilitiesResponseSchema,
  witnessledgerizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchWitnessledgerizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/witnessledgerizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return witnessledgerizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchWitnessledgerizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/witnessledgerizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return witnessledgerizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeWitnessledgerizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_witnessledgerizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/witnessledgerizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return witnessledgerizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatWitnessledgerizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatWitnessledgerizabilityRolloutCheckStatus(
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

export function formatWitnessledgerizabilityAdminAction(action: 'refresh_witnessledgerizability_summary') {
  switch (action) {
    case 'refresh_witnessledgerizability_summary':
      return 'Refresh witnessledgerizability summary'
  }
}

export function formatWitnessledgerizabilityDomain(
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

export async function fetchWitnessledgerizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/witnessledgerizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return witnessledgerizabilityCapabilitiesResponseSchema.parse(await response.json())
}
