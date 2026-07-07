import {
  complianceproofizabilityAdminActionResponseSchema,
  complianceproofizabilityAdminSummaryResponseSchema,
  complianceproofizabilityCapabilitiesResponseSchema,
  complianceproofizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchComplianceproofizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/complianceproofizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return complianceproofizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchComplianceproofizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/complianceproofizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return complianceproofizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeComplianceproofizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_complianceproofizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/complianceproofizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return complianceproofizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatComplianceproofizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatComplianceproofizabilityRolloutCheckStatus(
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

export function formatComplianceproofizabilityAdminAction(action: 'refresh_complianceproofizability_summary') {
  switch (action) {
    case 'refresh_complianceproofizability_summary':
      return 'Refresh complianceproofizability summary'
  }
}

export function formatComplianceproofizabilityDomain(
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

export async function fetchComplianceproofizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/complianceproofizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return complianceproofizabilityCapabilitiesResponseSchema.parse(await response.json())
}
