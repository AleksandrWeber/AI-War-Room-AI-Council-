import {
  oversightAdminActionResponseSchema,
  oversightAdminSummaryResponseSchema,
  oversightCapabilitiesResponseSchema,
  oversightRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchOversightRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/oversight/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return oversightRolloutResponseSchema.parse(await response.json())
}

export async function fetchOversightAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/oversight/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return oversightAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeOversightAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_oversight_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/oversight/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return oversightAdminActionResponseSchema.parse(await response.json())
}

export function formatOversightRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatOversightRolloutCheckStatus(
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

export function formatOversightAdminAction(
  action: 'refresh_oversight_summary',
) {
  switch (action) {
    case 'refresh_oversight_summary':
      return 'Refresh oversight summary'
  }
}

export function formatOversightDomain(
  domain:
    | 'completed_runs'
    | 'failed_runs'
    | 'billing_invoices'
    | 'billing_webhook_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_invoices':
      return 'Billing invoices'
    case 'billing_webhook_events':
      return 'Billing webhook events'
  }
}

export async function fetchOversightCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/oversight/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return oversightCapabilitiesResponseSchema.parse(await response.json())
}
