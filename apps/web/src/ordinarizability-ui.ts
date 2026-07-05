import {
  ordinarizabilityAdminActionResponseSchema,
  ordinarizabilityAdminSummaryResponseSchema,
  ordinarizabilityCapabilitiesResponseSchema,
  ordinarizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchOrdinarizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/ordinarizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return ordinarizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchOrdinarizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/ordinarizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return ordinarizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeOrdinarizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_ordinarizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/ordinarizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return ordinarizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatOrdinarizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatOrdinarizabilityRolloutCheckStatus(
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

export function formatOrdinarizabilityAdminAction(action: 'refresh_ordinarizability_summary') {
  switch (action) {
    case 'refresh_ordinarizability_summary':
      return 'Refresh ordinarizability summary'
  }
}

export function formatOrdinarizabilityDomain(
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

export async function fetchOrdinarizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/ordinarizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return ordinarizabilityCapabilitiesResponseSchema.parse(await response.json())
}
