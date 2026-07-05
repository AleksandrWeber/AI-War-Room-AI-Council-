import {
  virtualizabilityAdminActionResponseSchema,
  virtualizabilityAdminSummaryResponseSchema,
  virtualizabilityCapabilitiesResponseSchema,
  virtualizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchVirtualizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/virtualizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return virtualizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchVirtualizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/virtualizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return virtualizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeVirtualizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_virtualizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/virtualizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return virtualizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatVirtualizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatVirtualizabilityRolloutCheckStatus(
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

export function formatVirtualizabilityAdminAction(action: 'refresh_virtualizability_summary') {
  switch (action) {
    case 'refresh_virtualizability_summary':
      return 'Refresh virtualizability summary'
  }
}

export function formatVirtualizabilityDomain(
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

export async function fetchVirtualizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/virtualizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return virtualizabilityCapabilitiesResponseSchema.parse(await response.json())
}
