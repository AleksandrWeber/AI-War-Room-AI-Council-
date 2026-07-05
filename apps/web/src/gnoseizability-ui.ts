import {
  gnoseizabilityAdminActionResponseSchema,
  gnoseizabilityAdminSummaryResponseSchema,
  gnoseizabilityCapabilitiesResponseSchema,
  gnoseizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchGnoseizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/gnoseizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return gnoseizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchGnoseizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/gnoseizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return gnoseizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeGnoseizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_gnoseizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/gnoseizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return gnoseizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatGnoseizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatGnoseizabilityRolloutCheckStatus(
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

export function formatGnoseizabilityAdminAction(action: 'refresh_gnoseizability_summary') {
  switch (action) {
    case 'refresh_gnoseizability_summary':
      return 'Refresh gnoseizability summary'
  }
}

export function formatGnoseizabilityDomain(
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

export async function fetchGnoseizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/gnoseizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return gnoseizabilityCapabilitiesResponseSchema.parse(await response.json())
}
