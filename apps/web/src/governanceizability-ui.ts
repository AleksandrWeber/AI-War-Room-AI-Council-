import {
  governanceizabilityAdminActionResponseSchema,
  governanceizabilityAdminSummaryResponseSchema,
  governanceizabilityCapabilitiesResponseSchema,
  governanceizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchGovernanceizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/governanceizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return governanceizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchGovernanceizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/governanceizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return governanceizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeGovernanceizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_governanceizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/governanceizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return governanceizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatGovernanceizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatGovernanceizabilityRolloutCheckStatus(
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

export function formatGovernanceizabilityAdminAction(action: 'refresh_governanceizability_summary') {
  switch (action) {
    case 'refresh_governanceizability_summary':
      return 'Refresh governanceizability summary'
  }
}

export function formatGovernanceizabilityDomain(
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

export async function fetchGovernanceizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/governanceizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return governanceizabilityCapabilitiesResponseSchema.parse(await response.json())
}
