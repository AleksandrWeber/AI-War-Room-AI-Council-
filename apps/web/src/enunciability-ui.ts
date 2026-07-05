import {
  enunciabilityAdminActionResponseSchema,
  enunciabilityAdminSummaryResponseSchema,
  enunciabilityCapabilitiesResponseSchema,
  enunciabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchEnunciabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/enunciability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return enunciabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchEnunciabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/enunciability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return enunciabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeEnunciabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_enunciability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/enunciability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return enunciabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatEnunciabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatEnunciabilityRolloutCheckStatus(
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

export function formatEnunciabilityAdminAction(action: 'refresh_enunciability_summary') {
  switch (action) {
    case 'refresh_enunciability_summary':
      return 'Refresh enunciability summary'
  }
}

export function formatEnunciabilityDomain(
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

export async function fetchEnunciabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/enunciability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return enunciabilityCapabilitiesResponseSchema.parse(await response.json())
}
