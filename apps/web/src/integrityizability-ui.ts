import {
  integrityizabilityAdminActionResponseSchema,
  integrityizabilityAdminSummaryResponseSchema,
  integrityizabilityCapabilitiesResponseSchema,
  integrityizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchIntegrityizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/integrityizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return integrityizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchIntegrityizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/integrityizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return integrityizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeIntegrityizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_integrityizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/integrityizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return integrityizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatIntegrityizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatIntegrityizabilityRolloutCheckStatus(
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

export function formatIntegrityizabilityAdminAction(action: 'refresh_integrityizability_summary') {
  switch (action) {
    case 'refresh_integrityizability_summary':
      return 'Refresh integrityizability summary'
  }
}

export function formatIntegrityizabilityDomain(
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

export async function fetchIntegrityizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/integrityizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return integrityizabilityCapabilitiesResponseSchema.parse(await response.json())
}
