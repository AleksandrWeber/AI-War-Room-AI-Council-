import {
  tamperproofizabilityAdminActionResponseSchema,
  tamperproofizabilityAdminSummaryResponseSchema,
  tamperproofizabilityCapabilitiesResponseSchema,
  tamperproofizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTamperproofizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/tamperproofizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return tamperproofizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchTamperproofizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/tamperproofizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return tamperproofizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTamperproofizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_tamperproofizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/tamperproofizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return tamperproofizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatTamperproofizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTamperproofizabilityRolloutCheckStatus(
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

export function formatTamperproofizabilityAdminAction(action: 'refresh_tamperproofizability_summary') {
  switch (action) {
    case 'refresh_tamperproofizability_summary':
      return 'Refresh tamperproofizability summary'
  }
}

export function formatTamperproofizabilityDomain(
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

export async function fetchTamperproofizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/tamperproofizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return tamperproofizabilityCapabilitiesResponseSchema.parse(await response.json())
}
