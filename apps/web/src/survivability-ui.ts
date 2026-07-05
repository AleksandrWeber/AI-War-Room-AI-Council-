import {
  survivabilityAdminActionResponseSchema,
  survivabilityAdminSummaryResponseSchema,
  survivabilityCapabilitiesResponseSchema,
  survivabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSurvivabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/survivability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return survivabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSurvivabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/survivability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return survivabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSurvivabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_survivability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/survivability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return survivabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSurvivabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSurvivabilityRolloutCheckStatus(
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

export function formatSurvivabilityAdminAction(action: 'refresh_survivability_summary') {
  switch (action) {
    case 'refresh_survivability_summary':
      return 'Refresh survivability summary'
  }
}

export function formatSurvivabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_records' | 'billing_meter_usage_reports',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_records':
      return 'Billing records'
    case 'billing_meter_usage_reports':
      return 'Meter usage reports'
  }
}

export async function fetchSurvivabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/survivability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return survivabilityCapabilitiesResponseSchema.parse(await response.json())
}
