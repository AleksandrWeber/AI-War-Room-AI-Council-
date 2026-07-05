import {
  projectizabilityAdminActionResponseSchema,
  projectizabilityAdminSummaryResponseSchema,
  projectizabilityCapabilitiesResponseSchema,
  projectizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchProjectizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/projectizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return projectizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchProjectizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/projectizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return projectizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeProjectizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_projectizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/projectizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return projectizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatProjectizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatProjectizabilityRolloutCheckStatus(
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

export function formatProjectizabilityAdminAction(action: 'refresh_projectizability_summary') {
  switch (action) {
    case 'refresh_projectizability_summary':
      return 'Refresh projectizability summary'
  }
}

export function formatProjectizabilityDomain(
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

export async function fetchProjectizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/projectizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return projectizabilityCapabilitiesResponseSchema.parse(await response.json())
}
