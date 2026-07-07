import {
  modifiabilityvaultizabilityAdminActionResponseSchema,
  modifiabilityvaultizabilityAdminSummaryResponseSchema,
  modifiabilityvaultizabilityCapabilitiesResponseSchema,
  modifiabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchModifiabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/modifiabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return modifiabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchModifiabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/modifiabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return modifiabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeModifiabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_modifiabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/modifiabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return modifiabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatModifiabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatModifiabilityvaultizabilityRolloutCheckStatus(
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

export function formatModifiabilityvaultizabilityAdminAction(action: 'refresh_modifiabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_modifiabilityvaultizability_summary':
      return 'Refresh modifiabilityvaultizability summary'
  }
}

export function formatModifiabilityvaultizabilityDomain(
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

export async function fetchModifiabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/modifiabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return modifiabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
