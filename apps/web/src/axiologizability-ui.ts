import {
  axiologizabilityAdminActionResponseSchema,
  axiologizabilityAdminSummaryResponseSchema,
  axiologizabilityCapabilitiesResponseSchema,
  axiologizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAxiologizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/axiologizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return axiologizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAxiologizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/axiologizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return axiologizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAxiologizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_axiologizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/axiologizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return axiologizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAxiologizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAxiologizabilityRolloutCheckStatus(
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

export function formatAxiologizabilityAdminAction(action: 'refresh_axiologizability_summary') {
  switch (action) {
    case 'refresh_axiologizability_summary':
      return 'Refresh axiologizability summary'
  }
}

export function formatAxiologizabilityDomain(
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

export async function fetchAxiologizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/axiologizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return axiologizabilityCapabilitiesResponseSchema.parse(await response.json())
}
