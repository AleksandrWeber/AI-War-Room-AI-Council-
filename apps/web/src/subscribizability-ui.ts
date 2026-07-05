import {
  subscribizabilityAdminActionResponseSchema,
  subscribizabilityAdminSummaryResponseSchema,
  subscribizabilityCapabilitiesResponseSchema,
  subscribizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSubscribizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/subscribizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return subscribizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSubscribizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/subscribizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return subscribizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSubscribizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_subscribizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/subscribizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return subscribizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSubscribizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSubscribizabilityRolloutCheckStatus(
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

export function formatSubscribizabilityAdminAction(action: 'refresh_subscribizability_summary') {
  switch (action) {
    case 'refresh_subscribizability_summary':
      return 'Refresh subscribizability summary'
  }
}

export function formatSubscribizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_webhook_events' | 'billing_records',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_webhook_events':
      return 'Billing webhook events'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchSubscribizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/subscribizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return subscribizabilityCapabilitiesResponseSchema.parse(await response.json())
}
