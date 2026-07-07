import {
  adjustabilityvaultizabilityAdminActionResponseSchema,
  adjustabilityvaultizabilityAdminSummaryResponseSchema,
  adjustabilityvaultizabilityCapabilitiesResponseSchema,
  adjustabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAdjustabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/adjustabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return adjustabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAdjustabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/adjustabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return adjustabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAdjustabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_adjustabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/adjustabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return adjustabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAdjustabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAdjustabilityvaultizabilityRolloutCheckStatus(
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

export function formatAdjustabilityvaultizabilityAdminAction(action: 'refresh_adjustabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_adjustabilityvaultizability_summary':
      return 'Refresh adjustabilityvaultizability summary'
  }
}

export function formatAdjustabilityvaultizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_notifications' | 'billing_webhook_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_notifications':
      return 'Billing notifications'
    case 'billing_webhook_events':
      return 'Billing webhook events'
  }
}

export async function fetchAdjustabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/adjustabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return adjustabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
