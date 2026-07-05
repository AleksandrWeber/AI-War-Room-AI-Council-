import {
  metaphorizabilityAdminActionResponseSchema,
  metaphorizabilityAdminSummaryResponseSchema,
  metaphorizabilityCapabilitiesResponseSchema,
  metaphorizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchMetaphorizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/metaphorizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return metaphorizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchMetaphorizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/metaphorizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return metaphorizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeMetaphorizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_metaphorizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/metaphorizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return metaphorizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatMetaphorizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatMetaphorizabilityRolloutCheckStatus(
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

export function formatMetaphorizabilityAdminAction(action: 'refresh_metaphorizability_summary') {
  switch (action) {
    case 'refresh_metaphorizability_summary':
      return 'Refresh metaphorizability summary'
  }
}

export function formatMetaphorizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_provider_credentials' | 'billing_webhook_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_provider_credentials':
      return 'Provider credentials'
    case 'billing_webhook_events':
      return 'Billing webhook events'
  }
}

export async function fetchMetaphorizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/metaphorizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return metaphorizabilityCapabilitiesResponseSchema.parse(await response.json())
}
