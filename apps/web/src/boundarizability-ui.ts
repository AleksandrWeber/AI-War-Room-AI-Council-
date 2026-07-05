import {
  boundarizabilityAdminActionResponseSchema,
  boundarizabilityAdminSummaryResponseSchema,
  boundarizabilityCapabilitiesResponseSchema,
  boundarizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchBoundarizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/boundarizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return boundarizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchBoundarizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/boundarizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return boundarizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeBoundarizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_boundarizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/boundarizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return boundarizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatBoundarizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatBoundarizabilityRolloutCheckStatus(
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

export function formatBoundarizabilityAdminAction(action: 'refresh_boundarizability_summary') {
  switch (action) {
    case 'refresh_boundarizability_summary':
      return 'Refresh boundarizability summary'
  }
}

export function formatBoundarizabilityDomain(
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

export async function fetchBoundarizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/boundarizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return boundarizabilityCapabilitiesResponseSchema.parse(await response.json())
}
