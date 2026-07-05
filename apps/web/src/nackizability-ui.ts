import {
  nackizabilityAdminActionResponseSchema,
  nackizabilityAdminSummaryResponseSchema,
  nackizabilityCapabilitiesResponseSchema,
  nackizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchNackizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/nackizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return nackizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchNackizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/nackizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return nackizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeNackizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_nackizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/nackizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return nackizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatNackizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatNackizabilityRolloutCheckStatus(
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

export function formatNackizabilityAdminAction(action: 'refresh_nackizability_summary') {
  switch (action) {
    case 'refresh_nackizability_summary':
      return 'Refresh nackizability summary'
  }
}

export function formatNackizabilityDomain(
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

export async function fetchNackizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/nackizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return nackizabilityCapabilitiesResponseSchema.parse(await response.json())
}
