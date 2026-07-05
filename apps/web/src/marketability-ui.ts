import {
  marketabilityAdminActionResponseSchema,
  marketabilityAdminSummaryResponseSchema,
  marketabilityCapabilitiesResponseSchema,
  marketabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchMarketabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/marketability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return marketabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchMarketabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/marketability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return marketabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeMarketabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_marketability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/marketability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return marketabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatMarketabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatMarketabilityRolloutCheckStatus(
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

export function formatMarketabilityAdminAction(action: 'refresh_marketability_summary') {
  switch (action) {
    case 'refresh_marketability_summary':
      return 'Refresh marketability summary'
  }
}

export function formatMarketabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_memberships' | 'billing_meter_usage_reports',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_memberships':
      return 'Workspace memberships'
    case 'billing_meter_usage_reports':
      return 'Meter usage reports'
  }
}

export async function fetchMarketabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/marketability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return marketabilityCapabilitiesResponseSchema.parse(await response.json())
}
