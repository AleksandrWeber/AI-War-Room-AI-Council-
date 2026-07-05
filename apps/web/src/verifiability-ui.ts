import {
  verifiabilityAdminActionResponseSchema,
  verifiabilityAdminSummaryResponseSchema,
  verifiabilityCapabilitiesResponseSchema,
  verifiabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchVerifiabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/verifiability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return verifiabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchVerifiabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/verifiability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return verifiabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeVerifiabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_verifiability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/verifiability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return verifiabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatVerifiabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatVerifiabilityRolloutCheckStatus(
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

export function formatVerifiabilityAdminAction(action: 'refresh_verifiability_summary') {
  switch (action) {
    case 'refresh_verifiability_summary':
      return 'Refresh verifiability summary'
  }
}

export function formatVerifiabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_invoices' | 'billing_webhook_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_invoices':
      return 'Billing invoices'
    case 'billing_webhook_events':
      return 'Billing webhook events'
  }
}

export async function fetchVerifiabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/verifiability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return verifiabilityCapabilitiesResponseSchema.parse(await response.json())
}
