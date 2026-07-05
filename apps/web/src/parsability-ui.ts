import {
  parsabilityAdminActionResponseSchema,
  parsabilityAdminSummaryResponseSchema,
  parsabilityCapabilitiesResponseSchema,
  parsabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchParsabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/parsability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return parsabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchParsabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/parsability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return parsabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeParsabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_parsability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/parsability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return parsabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatParsabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatParsabilityRolloutCheckStatus(
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

export function formatParsabilityAdminAction(action: 'refresh_parsability_summary') {
  switch (action) {
    case 'refresh_parsability_summary':
      return 'Refresh parsability summary'
  }
}

export function formatParsabilityDomain(
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

export async function fetchParsabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/parsability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return parsabilityCapabilitiesResponseSchema.parse(await response.json())
}
