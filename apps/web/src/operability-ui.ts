import {
  operabilityAdminActionResponseSchema,
  operabilityAdminSummaryResponseSchema,
  operabilityCapabilitiesResponseSchema,
  operabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchOperabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/operability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return operabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchOperabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/operability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return operabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeOperabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_operability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/operability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return operabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatOperabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatOperabilityRolloutCheckStatus(
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

export function formatOperabilityAdminAction(action: 'refresh_operability_summary') {
  switch (action) {
    case 'refresh_operability_summary':
      return 'Refresh operability summary'
  }
}

export function formatOperabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_notifications' | 'billing_records',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_notifications':
      return 'Billing notifications'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchOperabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/operability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return operabilityCapabilitiesResponseSchema.parse(await response.json())
}
