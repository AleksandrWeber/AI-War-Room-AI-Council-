import {
  broadcastizabilityAdminActionResponseSchema,
  broadcastizabilityAdminSummaryResponseSchema,
  broadcastizabilityCapabilitiesResponseSchema,
  broadcastizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchBroadcastizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/broadcastizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return broadcastizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchBroadcastizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/broadcastizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return broadcastizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeBroadcastizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_broadcastizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/broadcastizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return broadcastizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatBroadcastizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatBroadcastizabilityRolloutCheckStatus(
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

export function formatBroadcastizabilityAdminAction(action: 'refresh_broadcastizability_summary') {
  switch (action) {
    case 'refresh_broadcastizability_summary':
      return 'Refresh broadcastizability summary'
  }
}

export function formatBroadcastizabilityDomain(
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

export async function fetchBroadcastizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/broadcastizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return broadcastizabilityCapabilitiesResponseSchema.parse(await response.json())
}
