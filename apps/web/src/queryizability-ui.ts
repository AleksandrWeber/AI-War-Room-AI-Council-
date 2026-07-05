import {
  queryizabilityAdminActionResponseSchema,
  queryizabilityAdminSummaryResponseSchema,
  queryizabilityCapabilitiesResponseSchema,
  queryizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchQueryizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/queryizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return queryizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchQueryizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/queryizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return queryizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeQueryizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_queryizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/queryizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return queryizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatQueryizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatQueryizabilityRolloutCheckStatus(
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

export function formatQueryizabilityAdminAction(action: 'refresh_queryizability_summary') {
  switch (action) {
    case 'refresh_queryizability_summary':
      return 'Refresh queryizability summary'
  }
}

export function formatQueryizabilityDomain(
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

export async function fetchQueryizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/queryizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return queryizabilityCapabilitiesResponseSchema.parse(await response.json())
}
