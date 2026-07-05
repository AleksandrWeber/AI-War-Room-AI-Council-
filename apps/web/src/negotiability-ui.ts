import {
  negotiabilityAdminActionResponseSchema,
  negotiabilityAdminSummaryResponseSchema,
  negotiabilityCapabilitiesResponseSchema,
  negotiabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchNegotiabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/negotiability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return negotiabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchNegotiabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/negotiability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return negotiabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeNegotiabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_negotiability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/negotiability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return negotiabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatNegotiabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatNegotiabilityRolloutCheckStatus(
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

export function formatNegotiabilityAdminAction(action: 'refresh_negotiability_summary') {
  switch (action) {
    case 'refresh_negotiability_summary':
      return 'Refresh negotiability summary'
  }
}

export function formatNegotiabilityDomain(
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

export async function fetchNegotiabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/negotiability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return negotiabilityCapabilitiesResponseSchema.parse(await response.json())
}
