import {
  tunabilityAdminActionResponseSchema,
  tunabilityAdminSummaryResponseSchema,
  tunabilityCapabilitiesResponseSchema,
  tunabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTunabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/tunability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return tunabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchTunabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/tunability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return tunabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTunabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_tunability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/tunability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return tunabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatTunabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTunabilityRolloutCheckStatus(
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

export function formatTunabilityAdminAction(action: 'refresh_tunability_summary') {
  switch (action) {
    case 'refresh_tunability_summary':
      return 'Refresh tunability summary'
  }
}

export function formatTunabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'usage_events' | 'idempotency_keys',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'usage_events':
      return 'Usage events'
    case 'idempotency_keys':
      return 'Idempotency keys'
  }
}

export async function fetchTunabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/tunability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return tunabilityCapabilitiesResponseSchema.parse(await response.json())
}
