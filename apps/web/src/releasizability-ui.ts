import {
  releasizabilityAdminActionResponseSchema,
  releasizabilityAdminSummaryResponseSchema,
  releasizabilityCapabilitiesResponseSchema,
  releasizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchReleasizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/releasizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return releasizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchReleasizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/releasizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return releasizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeReleasizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_releasizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/releasizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return releasizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatReleasizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatReleasizabilityRolloutCheckStatus(
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

export function formatReleasizabilityAdminAction(action: 'refresh_releasizability_summary') {
  switch (action) {
    case 'refresh_releasizability_summary':
      return 'Refresh releasizability summary'
  }
}

export function formatReleasizabilityDomain(
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

export async function fetchReleasizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/releasizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return releasizabilityCapabilitiesResponseSchema.parse(await response.json())
}
