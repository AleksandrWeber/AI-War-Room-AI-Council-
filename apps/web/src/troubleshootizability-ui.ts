import {
  troubleshootizabilityAdminActionResponseSchema,
  troubleshootizabilityAdminSummaryResponseSchema,
  troubleshootizabilityCapabilitiesResponseSchema,
  troubleshootizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTroubleshootizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/troubleshootizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return troubleshootizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchTroubleshootizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/troubleshootizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return troubleshootizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTroubleshootizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_troubleshootizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/troubleshootizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return troubleshootizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatTroubleshootizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTroubleshootizabilityRolloutCheckStatus(
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

export function formatTroubleshootizabilityAdminAction(action: 'refresh_troubleshootizability_summary') {
  switch (action) {
    case 'refresh_troubleshootizability_summary':
      return 'Refresh troubleshootizability summary'
  }
}

export function formatTroubleshootizabilityDomain(
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

export async function fetchTroubleshootizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/troubleshootizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return troubleshootizabilityCapabilitiesResponseSchema.parse(await response.json())
}
