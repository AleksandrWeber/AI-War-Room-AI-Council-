import {
  approximatizabilityAdminActionResponseSchema,
  approximatizabilityAdminSummaryResponseSchema,
  approximatizabilityCapabilitiesResponseSchema,
  approximatizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchApproximatizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/approximatizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return approximatizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchApproximatizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/approximatizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return approximatizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeApproximatizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_approximatizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/approximatizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return approximatizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatApproximatizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatApproximatizabilityRolloutCheckStatus(
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

export function formatApproximatizabilityAdminAction(action: 'refresh_approximatizability_summary') {
  switch (action) {
    case 'refresh_approximatizability_summary':
      return 'Refresh approximatizability summary'
  }
}

export function formatApproximatizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_webhook_events' | 'billing_records',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_webhook_events':
      return 'Billing webhook events'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchApproximatizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/approximatizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return approximatizabilityCapabilitiesResponseSchema.parse(await response.json())
}
