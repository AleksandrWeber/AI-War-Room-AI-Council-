import {
  falsifiizabilityAdminActionResponseSchema,
  falsifiizabilityAdminSummaryResponseSchema,
  falsifiizabilityCapabilitiesResponseSchema,
  falsifiizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchFalsifiizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/falsifiizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return falsifiizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchFalsifiizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/falsifiizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return falsifiizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeFalsifiizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_falsifiizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/falsifiizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return falsifiizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatFalsifiizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatFalsifiizabilityRolloutCheckStatus(
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

export function formatFalsifiizabilityAdminAction(action: 'refresh_falsifiizability_summary') {
  switch (action) {
    case 'refresh_falsifiizability_summary':
      return 'Refresh falsifiizability summary'
  }
}

export function formatFalsifiizabilityDomain(
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

export async function fetchFalsifiizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/falsifiizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return falsifiizabilityCapabilitiesResponseSchema.parse(await response.json())
}
