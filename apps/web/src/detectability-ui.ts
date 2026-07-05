import {
  detectabilityAdminActionResponseSchema,
  detectabilityAdminSummaryResponseSchema,
  detectabilityCapabilitiesResponseSchema,
  detectabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDetectabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/detectability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return detectabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDetectabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/detectability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return detectabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDetectabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_detectability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/detectability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return detectabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDetectabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDetectabilityRolloutCheckStatus(
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

export function formatDetectabilityAdminAction(action: 'refresh_detectability_summary') {
  switch (action) {
    case 'refresh_detectability_summary':
      return 'Refresh detectability summary'
  }
}

export function formatDetectabilityDomain(
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

export async function fetchDetectabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/detectability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return detectabilityCapabilitiesResponseSchema.parse(await response.json())
}
