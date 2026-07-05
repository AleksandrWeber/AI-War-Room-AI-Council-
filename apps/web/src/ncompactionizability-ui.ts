import {
  ncompactionizabilityAdminActionResponseSchema,
  ncompactionizabilityAdminSummaryResponseSchema,
  ncompactionizabilityCapabilitiesResponseSchema,
  ncompactionizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchNcompactionizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/ncompactionizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return ncompactionizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchNcompactionizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/ncompactionizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return ncompactionizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeNcompactionizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_ncompactionizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/ncompactionizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return ncompactionizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatNcompactionizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatNcompactionizabilityRolloutCheckStatus(
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

export function formatNcompactionizabilityAdminAction(action: 'refresh_ncompactionizability_summary') {
  switch (action) {
    case 'refresh_ncompactionizability_summary':
      return 'Refresh ncompactionizability summary'
  }
}

export function formatNcompactionizabilityDomain(
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

export async function fetchNcompactionizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/ncompactionizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return ncompactionizabilityCapabilitiesResponseSchema.parse(await response.json())
}
