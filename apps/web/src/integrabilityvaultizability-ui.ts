import {
  integrabilityvaultizabilityAdminActionResponseSchema,
  integrabilityvaultizabilityAdminSummaryResponseSchema,
  integrabilityvaultizabilityCapabilitiesResponseSchema,
  integrabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchIntegrabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/integrabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return integrabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchIntegrabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/integrabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return integrabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeIntegrabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_integrabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/integrabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return integrabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatIntegrabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatIntegrabilityvaultizabilityRolloutCheckStatus(
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

export function formatIntegrabilityvaultizabilityAdminAction(action: 'refresh_integrabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_integrabilityvaultizability_summary':
      return 'Refresh integrabilityvaultizability summary'
  }
}

export function formatIntegrabilityvaultizabilityDomain(
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

export async function fetchIntegrabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/integrabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return integrabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
