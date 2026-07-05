import {
  orchestrationizabilityAdminActionResponseSchema,
  orchestrationizabilityAdminSummaryResponseSchema,
  orchestrationizabilityCapabilitiesResponseSchema,
  orchestrationizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchOrchestrationizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/orchestrationizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return orchestrationizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchOrchestrationizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/orchestrationizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return orchestrationizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeOrchestrationizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_orchestrationizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/orchestrationizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return orchestrationizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatOrchestrationizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatOrchestrationizabilityRolloutCheckStatus(
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

export function formatOrchestrationizabilityAdminAction(action: 'refresh_orchestrationizability_summary') {
  switch (action) {
    case 'refresh_orchestrationizability_summary':
      return 'Refresh orchestrationizability summary'
  }
}

export function formatOrchestrationizabilityDomain(
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

export async function fetchOrchestrationizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/orchestrationizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return orchestrationizabilityCapabilitiesResponseSchema.parse(await response.json())
}
