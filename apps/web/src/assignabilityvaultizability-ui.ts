import {
  assignabilityvaultizabilityAdminActionResponseSchema,
  assignabilityvaultizabilityAdminSummaryResponseSchema,
  assignabilityvaultizabilityCapabilitiesResponseSchema,
  assignabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAssignabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/assignabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return assignabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAssignabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/assignabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return assignabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAssignabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_assignabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/assignabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return assignabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAssignabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAssignabilityvaultizabilityRolloutCheckStatus(
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

export function formatAssignabilityvaultizabilityAdminAction(action: 'refresh_assignabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_assignabilityvaultizability_summary':
      return 'Refresh assignabilityvaultizability summary'
  }
}

export function formatAssignabilityvaultizabilityDomain(
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

export async function fetchAssignabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/assignabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return assignabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
