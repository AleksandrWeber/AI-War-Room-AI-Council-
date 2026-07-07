import {
  portabilityvaultizabilityAdminActionResponseSchema,
  portabilityvaultizabilityAdminSummaryResponseSchema,
  portabilityvaultizabilityCapabilitiesResponseSchema,
  portabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchPortabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/portabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return portabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchPortabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/portabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return portabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executePortabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_portabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/portabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return portabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatPortabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatPortabilityvaultizabilityRolloutCheckStatus(
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

export function formatPortabilityvaultizabilityAdminAction(action: 'refresh_portabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_portabilityvaultizability_summary':
      return 'Refresh portabilityvaultizability summary'
  }
}

export function formatPortabilityvaultizabilityDomain(
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

export async function fetchPortabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/portabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return portabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
