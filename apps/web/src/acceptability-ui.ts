import {
  acceptabilityAdminActionResponseSchema,
  acceptabilityAdminSummaryResponseSchema,
  acceptabilityCapabilitiesResponseSchema,
  acceptabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAcceptabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/acceptability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return acceptabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAcceptabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/acceptability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return acceptabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAcceptabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_acceptability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/acceptability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return acceptabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAcceptabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAcceptabilityRolloutCheckStatus(
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

export function formatAcceptabilityAdminAction(action: 'refresh_acceptability_summary') {
  switch (action) {
    case 'refresh_acceptability_summary':
      return 'Refresh acceptability summary'
  }
}

export function formatAcceptabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_records' | 'billing_invoices',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_records':
      return 'Billing records'
    case 'billing_invoices':
      return 'Billing invoices'
  }
}

export async function fetchAcceptabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/acceptability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return acceptabilityCapabilitiesResponseSchema.parse(await response.json())
}
