import {
  observabilizabilityAdminActionResponseSchema,
  observabilizabilityAdminSummaryResponseSchema,
  observabilizabilityCapabilitiesResponseSchema,
  observabilizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchObservabilizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/observabilizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return observabilizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchObservabilizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/observabilizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return observabilizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeObservabilizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_observabilizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/observabilizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return observabilizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatObservabilizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatObservabilizabilityRolloutCheckStatus(
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

export function formatObservabilizabilityAdminAction(action: 'refresh_observabilizability_summary') {
  switch (action) {
    case 'refresh_observabilizability_summary':
      return 'Refresh observabilizability summary'
  }
}

export function formatObservabilizabilityDomain(
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

export async function fetchObservabilizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/observabilizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return observabilizabilityCapabilitiesResponseSchema.parse(await response.json())
}
