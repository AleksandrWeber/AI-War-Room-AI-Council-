import {
  justifiabilityAdminActionResponseSchema,
  justifiabilityAdminSummaryResponseSchema,
  justifiabilityCapabilitiesResponseSchema,
  justifiabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchJustifiabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/justifiability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return justifiabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchJustifiabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/justifiability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return justifiabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeJustifiabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_justifiability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/justifiability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return justifiabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatJustifiabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatJustifiabilityRolloutCheckStatus(
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

export function formatJustifiabilityAdminAction(action: 'refresh_justifiability_summary') {
  switch (action) {
    case 'refresh_justifiability_summary':
      return 'Refresh justifiability summary'
  }
}

export function formatJustifiabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'shield_reviews' | 'idempotency_keys',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'shield_reviews':
      return 'Shield reviews'
    case 'idempotency_keys':
      return 'Idempotency keys'
  }
}

export async function fetchJustifiabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/justifiability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return justifiabilityCapabilitiesResponseSchema.parse(await response.json())
}
