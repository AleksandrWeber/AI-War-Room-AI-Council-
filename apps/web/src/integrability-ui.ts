import {
  integrabilityAdminActionResponseSchema,
  integrabilityAdminSummaryResponseSchema,
  integrabilityCapabilitiesResponseSchema,
  integrabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchIntegrabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/integrability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return integrabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchIntegrabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/integrability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return integrabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeIntegrabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_integrability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/integrability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return integrabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatIntegrabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatIntegrabilityRolloutCheckStatus(
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

export function formatIntegrabilityAdminAction(action: 'refresh_integrability_summary') {
  switch (action) {
    case 'refresh_integrability_summary':
      return 'Refresh integrability summary'
  }
}

export function formatIntegrabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_webhook_events' | 'workspace_memberships',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_webhook_events':
      return 'Billing webhook events'
    case 'workspace_memberships':
      return 'Workspace memberships'
  }
}

export async function fetchIntegrabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/integrability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return integrabilityCapabilitiesResponseSchema.parse(await response.json())
}
