import {
  adaptabilityAdminActionResponseSchema,
  adaptabilityAdminSummaryResponseSchema,
  adaptabilityCapabilitiesResponseSchema,
  adaptabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAdaptabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/adaptability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return adaptabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAdaptabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/adaptability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return adaptabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAdaptabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_adaptability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/adaptability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return adaptabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAdaptabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAdaptabilityRolloutCheckStatus(
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

export function formatAdaptabilityAdminAction(action: 'refresh_adaptability_summary') {
  switch (action) {
    case 'refresh_adaptability_summary':
      return 'Refresh adaptability summary'
  }
}

export function formatAdaptabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_webhook_events' | 'billing_notifications',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_webhook_events':
      return 'Billing webhook events'
    case 'billing_notifications':
      return 'Billing notifications'
  }
}

export async function fetchAdaptabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/adaptability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return adaptabilityCapabilitiesResponseSchema.parse(await response.json())
}
