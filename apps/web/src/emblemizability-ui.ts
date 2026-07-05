import {
  emblemizabilityAdminActionResponseSchema,
  emblemizabilityAdminSummaryResponseSchema,
  emblemizabilityCapabilitiesResponseSchema,
  emblemizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchEmblemizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/emblemizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return emblemizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchEmblemizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/emblemizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return emblemizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeEmblemizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_emblemizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/emblemizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return emblemizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatEmblemizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatEmblemizabilityRolloutCheckStatus(
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

export function formatEmblemizabilityAdminAction(action: 'refresh_emblemizability_summary') {
  switch (action) {
    case 'refresh_emblemizability_summary':
      return 'Refresh emblemizability summary'
  }
}

export function formatEmblemizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_notifications' | 'billing_webhook_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_notifications':
      return 'Billing notifications'
    case 'billing_webhook_events':
      return 'Billing webhook events'
  }
}

export async function fetchEmblemizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/emblemizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return emblemizabilityCapabilitiesResponseSchema.parse(await response.json())
}
