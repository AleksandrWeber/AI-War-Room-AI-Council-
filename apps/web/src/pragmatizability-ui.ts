import {
  pragmatizabilityAdminActionResponseSchema,
  pragmatizabilityAdminSummaryResponseSchema,
  pragmatizabilityCapabilitiesResponseSchema,
  pragmatizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchPragmatizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/pragmatizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return pragmatizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchPragmatizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/pragmatizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return pragmatizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executePragmatizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_pragmatizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/pragmatizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return pragmatizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatPragmatizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatPragmatizabilityRolloutCheckStatus(
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

export function formatPragmatizabilityAdminAction(action: 'refresh_pragmatizability_summary') {
  switch (action) {
    case 'refresh_pragmatizability_summary':
      return 'Refresh pragmatizability summary'
  }
}

export function formatPragmatizabilityDomain(
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

export async function fetchPragmatizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/pragmatizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return pragmatizabilityCapabilitiesResponseSchema.parse(await response.json())
}
