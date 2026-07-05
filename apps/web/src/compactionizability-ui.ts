import {
  compactionizabilityAdminActionResponseSchema,
  compactionizabilityAdminSummaryResponseSchema,
  compactionizabilityCapabilitiesResponseSchema,
  compactionizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCompactionizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/compactionizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return compactionizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCompactionizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/compactionizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return compactionizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCompactionizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_compactionizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/compactionizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return compactionizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCompactionizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCompactionizabilityRolloutCheckStatus(
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

export function formatCompactionizabilityAdminAction(action: 'refresh_compactionizability_summary') {
  switch (action) {
    case 'refresh_compactionizability_summary':
      return 'Refresh compactionizability summary'
  }
}

export function formatCompactionizabilityDomain(
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

export async function fetchCompactionizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/compactionizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return compactionizabilityCapabilitiesResponseSchema.parse(await response.json())
}
