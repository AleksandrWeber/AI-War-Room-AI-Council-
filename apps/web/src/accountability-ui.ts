import {
  accountabilityAdminActionResponseSchema,
  accountabilityAdminSummaryResponseSchema,
  accountabilityCapabilitiesResponseSchema,
  accountabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAccountabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/accountability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return accountabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAccountabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/accountability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return accountabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAccountabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_accountability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/accountability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return accountabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAccountabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAccountabilityRolloutCheckStatus(
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

export function formatAccountabilityAdminAction(
  action: 'refresh_accountability_summary',
) {
  switch (action) {
    case 'refresh_accountability_summary':
      return 'Refresh accountability summary'
  }
}

export function formatAccountabilityDomain(
  domain:
    | 'completed_runs'
    | 'failed_runs'
    | 'idempotency_keys'
    | 'billing_records',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'idempotency_keys':
      return 'Idempotency keys'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchAccountabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/accountability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return accountabilityCapabilitiesResponseSchema.parse(await response.json())
}
