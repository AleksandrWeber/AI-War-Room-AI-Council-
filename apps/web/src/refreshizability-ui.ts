import {
  refreshizabilityAdminActionResponseSchema,
  refreshizabilityAdminSummaryResponseSchema,
  refreshizabilityCapabilitiesResponseSchema,
  refreshizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRefreshizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/refreshizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return refreshizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRefreshizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/refreshizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return refreshizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRefreshizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_refreshizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/refreshizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return refreshizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRefreshizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRefreshizabilityRolloutCheckStatus(
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

export function formatRefreshizabilityAdminAction(action: 'refresh_refreshizability_summary') {
  switch (action) {
    case 'refresh_refreshizability_summary':
      return 'Refresh refreshizability summary'
  }
}

export function formatRefreshizabilityDomain(
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

export async function fetchRefreshizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/refreshizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return refreshizabilityCapabilitiesResponseSchema.parse(await response.json())
}
