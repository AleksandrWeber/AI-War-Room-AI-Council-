import {
  harmonizabilityAdminActionResponseSchema,
  harmonizabilityAdminSummaryResponseSchema,
  harmonizabilityCapabilitiesResponseSchema,
  harmonizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchHarmonizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/harmonizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return harmonizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchHarmonizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/harmonizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return harmonizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeHarmonizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_harmonizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/harmonizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return harmonizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatHarmonizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatHarmonizabilityRolloutCheckStatus(
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

export function formatHarmonizabilityAdminAction(action: 'refresh_harmonizability_summary') {
  switch (action) {
    case 'refresh_harmonizability_summary':
      return 'Refresh harmonizability summary'
  }
}

export function formatHarmonizabilityDomain(
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

export async function fetchHarmonizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/harmonizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return harmonizabilityCapabilitiesResponseSchema.parse(await response.json())
}
