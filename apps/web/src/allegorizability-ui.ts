import {
  allegorizabilityAdminActionResponseSchema,
  allegorizabilityAdminSummaryResponseSchema,
  allegorizabilityCapabilitiesResponseSchema,
  allegorizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAllegorizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/allegorizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return allegorizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAllegorizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/allegorizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return allegorizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAllegorizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_allegorizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/allegorizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return allegorizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAllegorizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAllegorizabilityRolloutCheckStatus(
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

export function formatAllegorizabilityAdminAction(action: 'refresh_allegorizability_summary') {
  switch (action) {
    case 'refresh_allegorizability_summary':
      return 'Refresh allegorizability summary'
  }
}

export function formatAllegorizabilityDomain(
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

export async function fetchAllegorizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/allegorizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return allegorizabilityCapabilitiesResponseSchema.parse(await response.json())
}
