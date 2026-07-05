import {
  systematizabilityAdminActionResponseSchema,
  systematizabilityAdminSummaryResponseSchema,
  systematizabilityCapabilitiesResponseSchema,
  systematizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSystematizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/systematizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return systematizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSystematizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/systematizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return systematizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSystematizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_systematizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/systematizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return systematizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSystematizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSystematizabilityRolloutCheckStatus(
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

export function formatSystematizabilityAdminAction(action: 'refresh_systematizability_summary') {
  switch (action) {
    case 'refresh_systematizability_summary':
      return 'Refresh systematizability summary'
  }
}

export function formatSystematizabilityDomain(
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

export async function fetchSystematizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/systematizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return systematizabilityCapabilitiesResponseSchema.parse(await response.json())
}
