import {
  navigabilityvaultizabilityAdminActionResponseSchema,
  navigabilityvaultizabilityAdminSummaryResponseSchema,
  navigabilityvaultizabilityCapabilitiesResponseSchema,
  navigabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchNavigabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/navigabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return navigabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchNavigabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/navigabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return navigabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeNavigabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_navigabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/navigabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return navigabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatNavigabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatNavigabilityvaultizabilityRolloutCheckStatus(
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

export function formatNavigabilityvaultizabilityAdminAction(action: 'refresh_navigabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_navigabilityvaultizability_summary':
      return 'Refresh navigabilityvaultizability summary'
  }
}

export function formatNavigabilityvaultizabilityDomain(
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

export async function fetchNavigabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/navigabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return navigabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
