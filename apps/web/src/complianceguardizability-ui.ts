import {
  complianceguardizabilityAdminActionResponseSchema,
  complianceguardizabilityAdminSummaryResponseSchema,
  complianceguardizabilityCapabilitiesResponseSchema,
  complianceguardizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchComplianceguardizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/complianceguardizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return complianceguardizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchComplianceguardizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/complianceguardizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return complianceguardizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeComplianceguardizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_complianceguardizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/complianceguardizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return complianceguardizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatComplianceguardizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatComplianceguardizabilityRolloutCheckStatus(
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

export function formatComplianceguardizabilityAdminAction(action: 'refresh_complianceguardizability_summary') {
  switch (action) {
    case 'refresh_complianceguardizability_summary':
      return 'Refresh complianceguardizability summary'
  }
}

export function formatComplianceguardizabilityDomain(
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

export async function fetchComplianceguardizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/complianceguardizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return complianceguardizabilityCapabilitiesResponseSchema.parse(await response.json())
}
