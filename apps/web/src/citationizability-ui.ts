import {
  citationizabilityAdminActionResponseSchema,
  citationizabilityAdminSummaryResponseSchema,
  citationizabilityCapabilitiesResponseSchema,
  citationizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCitationizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/citationizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return citationizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCitationizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/citationizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return citationizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCitationizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_citationizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/citationizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return citationizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCitationizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCitationizabilityRolloutCheckStatus(
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

export function formatCitationizabilityAdminAction(action: 'refresh_citationizability_summary') {
  switch (action) {
    case 'refresh_citationizability_summary':
      return 'Refresh citationizability summary'
  }
}

export function formatCitationizabilityDomain(
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

export async function fetchCitationizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/citationizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return citationizabilityCapabilitiesResponseSchema.parse(await response.json())
}
