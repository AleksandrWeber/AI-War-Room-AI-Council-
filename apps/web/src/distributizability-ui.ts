import {
  distributizabilityAdminActionResponseSchema,
  distributizabilityAdminSummaryResponseSchema,
  distributizabilityCapabilitiesResponseSchema,
  distributizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDistributizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/distributizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return distributizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDistributizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/distributizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return distributizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDistributizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_distributizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/distributizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return distributizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDistributizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDistributizabilityRolloutCheckStatus(
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

export function formatDistributizabilityAdminAction(action: 'refresh_distributizability_summary') {
  switch (action) {
    case 'refresh_distributizability_summary':
      return 'Refresh distributizability summary'
  }
}

export function formatDistributizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_meter_usage_reports' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_meter_usage_reports':
      return 'Meter usage reports'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchDistributizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/distributizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return distributizabilityCapabilitiesResponseSchema.parse(await response.json())
}
