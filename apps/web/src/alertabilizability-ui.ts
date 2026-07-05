import {
  alertabilizabilityAdminActionResponseSchema,
  alertabilizabilityAdminSummaryResponseSchema,
  alertabilizabilityCapabilitiesResponseSchema,
  alertabilizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAlertabilizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/alertabilizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return alertabilizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAlertabilizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/alertabilizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return alertabilizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAlertabilizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_alertabilizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/alertabilizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return alertabilizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAlertabilizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAlertabilizabilityRolloutCheckStatus(
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

export function formatAlertabilizabilityAdminAction(action: 'refresh_alertabilizability_summary') {
  switch (action) {
    case 'refresh_alertabilizability_summary':
      return 'Refresh alertabilizability summary'
  }
}

export function formatAlertabilizabilityDomain(
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

export async function fetchAlertabilizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/alertabilizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return alertabilizabilityCapabilitiesResponseSchema.parse(await response.json())
}
