import {
  ackizabilityAdminActionResponseSchema,
  ackizabilityAdminSummaryResponseSchema,
  ackizabilityCapabilitiesResponseSchema,
  ackizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAckizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/ackizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return ackizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAckizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/ackizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return ackizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAckizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_ackizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/ackizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return ackizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAckizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAckizabilityRolloutCheckStatus(
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

export function formatAckizabilityAdminAction(action: 'refresh_ackizability_summary') {
  switch (action) {
    case 'refresh_ackizability_summary':
      return 'Refresh ackizability summary'
  }
}

export function formatAckizabilityDomain(
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

export async function fetchAckizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/ackizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return ackizabilityCapabilitiesResponseSchema.parse(await response.json())
}
