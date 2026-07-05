import {
  viabilityAdminActionResponseSchema,
  viabilityAdminSummaryResponseSchema,
  viabilityCapabilitiesResponseSchema,
  viabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchViabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/viability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return viabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchViabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/viability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return viabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeViabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_viability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/viability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return viabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatViabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatViabilityRolloutCheckStatus(
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

export function formatViabilityAdminAction(action: 'refresh_viability_summary') {
  switch (action) {
    case 'refresh_viability_summary':
      return 'Refresh viability summary'
  }
}

export function formatViabilityDomain(
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

export async function fetchViabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/viability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return viabilityCapabilitiesResponseSchema.parse(await response.json())
}
