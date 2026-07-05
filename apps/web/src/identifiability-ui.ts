import {
  identifiabilityAdminActionResponseSchema,
  identifiabilityAdminSummaryResponseSchema,
  identifiabilityCapabilitiesResponseSchema,
  identifiabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchIdentifiabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/identifiability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return identifiabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchIdentifiabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/identifiability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return identifiabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeIdentifiabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_identifiability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/identifiability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return identifiabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatIdentifiabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatIdentifiabilityRolloutCheckStatus(
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

export function formatIdentifiabilityAdminAction(action: 'refresh_identifiability_summary') {
  switch (action) {
    case 'refresh_identifiability_summary':
      return 'Refresh identifiability summary'
  }
}

export function formatIdentifiabilityDomain(
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

export async function fetchIdentifiabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/identifiability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return identifiabilityCapabilitiesResponseSchema.parse(await response.json())
}
