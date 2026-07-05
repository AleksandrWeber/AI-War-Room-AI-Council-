import {
  curatizabilityAdminActionResponseSchema,
  curatizabilityAdminSummaryResponseSchema,
  curatizabilityCapabilitiesResponseSchema,
  curatizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCuratizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/curatizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return curatizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCuratizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/curatizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return curatizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCuratizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_curatizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/curatizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return curatizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCuratizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCuratizabilityRolloutCheckStatus(
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

export function formatCuratizabilityAdminAction(action: 'refresh_curatizability_summary') {
  switch (action) {
    case 'refresh_curatizability_summary':
      return 'Refresh curatizability summary'
  }
}

export function formatCuratizabilityDomain(
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

export async function fetchCuratizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/curatizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return curatizabilityCapabilitiesResponseSchema.parse(await response.json())
}
