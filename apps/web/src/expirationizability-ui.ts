import {
  expirationizabilityAdminActionResponseSchema,
  expirationizabilityAdminSummaryResponseSchema,
  expirationizabilityCapabilitiesResponseSchema,
  expirationizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchExpirationizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/expirationizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return expirationizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchExpirationizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/expirationizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return expirationizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeExpirationizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_expirationizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/expirationizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return expirationizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatExpirationizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatExpirationizabilityRolloutCheckStatus(
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

export function formatExpirationizabilityAdminAction(action: 'refresh_expirationizability_summary') {
  switch (action) {
    case 'refresh_expirationizability_summary':
      return 'Refresh expirationizability summary'
  }
}

export function formatExpirationizabilityDomain(
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

export async function fetchExpirationizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/expirationizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return expirationizabilityCapabilitiesResponseSchema.parse(await response.json())
}
