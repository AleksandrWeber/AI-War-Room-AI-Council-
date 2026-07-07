import {
  witnessproofizabilityAdminActionResponseSchema,
  witnessproofizabilityAdminSummaryResponseSchema,
  witnessproofizabilityCapabilitiesResponseSchema,
  witnessproofizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchWitnessproofizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/witnessproofizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return witnessproofizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchWitnessproofizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/witnessproofizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return witnessproofizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeWitnessproofizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_witnessproofizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/witnessproofizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return witnessproofizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatWitnessproofizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatWitnessproofizabilityRolloutCheckStatus(
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

export function formatWitnessproofizabilityAdminAction(action: 'refresh_witnessproofizability_summary') {
  switch (action) {
    case 'refresh_witnessproofizability_summary':
      return 'Refresh witnessproofizability summary'
  }
}

export function formatWitnessproofizabilityDomain(
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

export async function fetchWitnessproofizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/witnessproofizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return witnessproofizabilityCapabilitiesResponseSchema.parse(await response.json())
}
