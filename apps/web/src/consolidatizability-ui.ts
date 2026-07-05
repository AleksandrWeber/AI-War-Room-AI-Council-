import {
  consolidatizabilityAdminActionResponseSchema,
  consolidatizabilityAdminSummaryResponseSchema,
  consolidatizabilityCapabilitiesResponseSchema,
  consolidatizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchConsolidatizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/consolidatizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return consolidatizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchConsolidatizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/consolidatizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return consolidatizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeConsolidatizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_consolidatizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/consolidatizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return consolidatizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatConsolidatizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatConsolidatizabilityRolloutCheckStatus(
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

export function formatConsolidatizabilityAdminAction(action: 'refresh_consolidatizability_summary') {
  switch (action) {
    case 'refresh_consolidatizability_summary':
      return 'Refresh consolidatizability summary'
  }
}

export function formatConsolidatizabilityDomain(
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

export async function fetchConsolidatizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/consolidatizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return consolidatizabilityCapabilitiesResponseSchema.parse(await response.json())
}
