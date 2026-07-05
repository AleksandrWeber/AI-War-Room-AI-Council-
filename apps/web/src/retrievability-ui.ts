import {
  retrievabilityAdminActionResponseSchema,
  retrievabilityAdminSummaryResponseSchema,
  retrievabilityCapabilitiesResponseSchema,
  retrievabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRetrievabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/retrievability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return retrievabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRetrievabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/retrievability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return retrievabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRetrievabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_retrievability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/retrievability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return retrievabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRetrievabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRetrievabilityRolloutCheckStatus(
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

export function formatRetrievabilityAdminAction(action: 'refresh_retrievability_summary') {
  switch (action) {
    case 'refresh_retrievability_summary':
      return 'Refresh retrievability summary'
  }
}

export function formatRetrievabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'shield_scans' | 'idempotency_keys',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'shield_scans':
      return 'Shield scans'
    case 'idempotency_keys':
      return 'Idempotency keys'
  }
}

export async function fetchRetrievabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/retrievability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return retrievabilityCapabilitiesResponseSchema.parse(await response.json())
}
