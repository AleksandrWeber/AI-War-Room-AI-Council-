import {
  redundizabilityAdminActionResponseSchema,
  redundizabilityAdminSummaryResponseSchema,
  redundizabilityCapabilitiesResponseSchema,
  redundizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRedundizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/redundizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return redundizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRedundizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/redundizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return redundizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRedundizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_redundizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/redundizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return redundizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRedundizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRedundizabilityRolloutCheckStatus(
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

export function formatRedundizabilityAdminAction(action: 'refresh_redundizability_summary') {
  switch (action) {
    case 'refresh_redundizability_summary':
      return 'Refresh redundizability summary'
  }
}

export function formatRedundizabilityDomain(
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

export async function fetchRedundizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/redundizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return redundizabilityCapabilitiesResponseSchema.parse(await response.json())
}
