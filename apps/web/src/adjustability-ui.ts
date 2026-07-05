import {
  adjustabilityAdminActionResponseSchema,
  adjustabilityAdminSummaryResponseSchema,
  adjustabilityCapabilitiesResponseSchema,
  adjustabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAdjustabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/adjustability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return adjustabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAdjustabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/adjustability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return adjustabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAdjustabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_adjustability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/adjustability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return adjustabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAdjustabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAdjustabilityRolloutCheckStatus(
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

export function formatAdjustabilityAdminAction(action: 'refresh_adjustability_summary') {
  switch (action) {
    case 'refresh_adjustability_summary':
      return 'Refresh adjustability summary'
  }
}

export function formatAdjustabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_invoices' | 'workspace_memberships',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_invoices':
      return 'Billing invoices'
    case 'workspace_memberships':
      return 'Workspace memberships'
  }
}

export async function fetchAdjustabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/adjustability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return adjustabilityCapabilitiesResponseSchema.parse(await response.json())
}
