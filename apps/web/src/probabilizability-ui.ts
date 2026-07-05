import {
  probabilizabilityAdminActionResponseSchema,
  probabilizabilityAdminSummaryResponseSchema,
  probabilizabilityCapabilitiesResponseSchema,
  probabilizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchProbabilizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/probabilizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return probabilizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchProbabilizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/probabilizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return probabilizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeProbabilizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_probabilizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/probabilizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return probabilizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatProbabilizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatProbabilizabilityRolloutCheckStatus(
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

export function formatProbabilizabilityAdminAction(action: 'refresh_probabilizability_summary') {
  switch (action) {
    case 'refresh_probabilizability_summary':
      return 'Refresh probabilizability summary'
  }
}

export function formatProbabilizabilityDomain(
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

export async function fetchProbabilizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/probabilizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return probabilizabilityCapabilitiesResponseSchema.parse(await response.json())
}
