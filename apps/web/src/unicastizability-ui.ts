import {
  unicastizabilityAdminActionResponseSchema,
  unicastizabilityAdminSummaryResponseSchema,
  unicastizabilityCapabilitiesResponseSchema,
  unicastizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchUnicastizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/unicastizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return unicastizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchUnicastizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/unicastizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return unicastizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeUnicastizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_unicastizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/unicastizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return unicastizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatUnicastizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatUnicastizabilityRolloutCheckStatus(
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

export function formatUnicastizabilityAdminAction(action: 'refresh_unicastizability_summary') {
  switch (action) {
    case 'refresh_unicastizability_summary':
      return 'Refresh unicastizability summary'
  }
}

export function formatUnicastizabilityDomain(
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

export async function fetchUnicastizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/unicastizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return unicastizabilityCapabilitiesResponseSchema.parse(await response.json())
}
