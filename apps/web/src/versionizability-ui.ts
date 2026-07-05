import {
  versionizabilityAdminActionResponseSchema,
  versionizabilityAdminSummaryResponseSchema,
  versionizabilityCapabilitiesResponseSchema,
  versionizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchVersionizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/versionizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return versionizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchVersionizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/versionizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return versionizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeVersionizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_versionizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/versionizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return versionizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatVersionizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatVersionizabilityRolloutCheckStatus(
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

export function formatVersionizabilityAdminAction(action: 'refresh_versionizability_summary') {
  switch (action) {
    case 'refresh_versionizability_summary':
      return 'Refresh versionizability summary'
  }
}

export function formatVersionizabilityDomain(
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

export async function fetchVersionizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/versionizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return versionizabilityCapabilitiesResponseSchema.parse(await response.json())
}
