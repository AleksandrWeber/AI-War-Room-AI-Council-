import {
  substantiabilityAdminActionResponseSchema,
  substantiabilityAdminSummaryResponseSchema,
  substantiabilityCapabilitiesResponseSchema,
  substantiabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSubstantiabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/substantiability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return substantiabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSubstantiabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/substantiability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return substantiabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSubstantiabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_substantiability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/substantiability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return substantiabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSubstantiabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSubstantiabilityRolloutCheckStatus(
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

export function formatSubstantiabilityAdminAction(action: 'refresh_substantiability_summary') {
  switch (action) {
    case 'refresh_substantiability_summary':
      return 'Refresh substantiability summary'
  }
}

export function formatSubstantiabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_records' | 'idempotency_keys',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_records':
      return 'Billing records'
    case 'idempotency_keys':
      return 'Idempotency keys'
  }
}

export async function fetchSubstantiabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/substantiability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return substantiabilityCapabilitiesResponseSchema.parse(await response.json())
}
