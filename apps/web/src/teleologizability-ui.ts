import {
  teleologizabilityAdminActionResponseSchema,
  teleologizabilityAdminSummaryResponseSchema,
  teleologizabilityCapabilitiesResponseSchema,
  teleologizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTeleologizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/teleologizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return teleologizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchTeleologizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/teleologizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return teleologizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTeleologizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_teleologizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/teleologizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return teleologizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatTeleologizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTeleologizabilityRolloutCheckStatus(
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

export function formatTeleologizabilityAdminAction(action: 'refresh_teleologizability_summary') {
  switch (action) {
    case 'refresh_teleologizability_summary':
      return 'Refresh teleologizability summary'
  }
}

export function formatTeleologizabilityDomain(
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

export async function fetchTeleologizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/teleologizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return teleologizabilityCapabilitiesResponseSchema.parse(await response.json())
}
