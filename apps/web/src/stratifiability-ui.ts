import {
  stratifiabilityAdminActionResponseSchema,
  stratifiabilityAdminSummaryResponseSchema,
  stratifiabilityCapabilitiesResponseSchema,
  stratifiabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchStratifiabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/stratifiability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return stratifiabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchStratifiabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/stratifiability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return stratifiabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeStratifiabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_stratifiability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/stratifiability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return stratifiabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatStratifiabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatStratifiabilityRolloutCheckStatus(
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

export function formatStratifiabilityAdminAction(action: 'refresh_stratifiability_summary') {
  switch (action) {
    case 'refresh_stratifiability_summary':
      return 'Refresh stratifiability summary'
  }
}

export function formatStratifiabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_invoices' | 'billing_records',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_invoices':
      return 'Billing invoices'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchStratifiabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/stratifiability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return stratifiabilityCapabilitiesResponseSchema.parse(await response.json())
}
