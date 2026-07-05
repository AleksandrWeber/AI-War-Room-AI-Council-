import {
  topologizabilityAdminActionResponseSchema,
  topologizabilityAdminSummaryResponseSchema,
  topologizabilityCapabilitiesResponseSchema,
  topologizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTopologizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/topologizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return topologizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchTopologizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/topologizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return topologizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTopologizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_topologizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/topologizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return topologizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatTopologizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTopologizabilityRolloutCheckStatus(
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

export function formatTopologizabilityAdminAction(action: 'refresh_topologizability_summary') {
  switch (action) {
    case 'refresh_topologizability_summary':
      return 'Refresh topologizability summary'
  }
}

export function formatTopologizabilityDomain(
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

export async function fetchTopologizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/topologizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return topologizabilityCapabilitiesResponseSchema.parse(await response.json())
}
