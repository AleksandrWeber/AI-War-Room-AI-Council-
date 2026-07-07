import {
  zerotrustizabilityAdminActionResponseSchema,
  zerotrustizabilityAdminSummaryResponseSchema,
  zerotrustizabilityCapabilitiesResponseSchema,
  zerotrustizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchZerotrustizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/zerotrustizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return zerotrustizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchZerotrustizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/zerotrustizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return zerotrustizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeZerotrustizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_zerotrustizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/zerotrustizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return zerotrustizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatZerotrustizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatZerotrustizabilityRolloutCheckStatus(
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

export function formatZerotrustizabilityAdminAction(action: 'refresh_zerotrustizability_summary') {
  switch (action) {
    case 'refresh_zerotrustizability_summary':
      return 'Refresh zerotrustizability summary'
  }
}

export function formatZerotrustizabilityDomain(
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

export async function fetchZerotrustizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/zerotrustizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return zerotrustizabilityCapabilitiesResponseSchema.parse(await response.json())
}
