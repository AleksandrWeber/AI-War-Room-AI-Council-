import {
  iterativizabilityAdminActionResponseSchema,
  iterativizabilityAdminSummaryResponseSchema,
  iterativizabilityCapabilitiesResponseSchema,
  iterativizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchIterativizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/iterativizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return iterativizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchIterativizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/iterativizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return iterativizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeIterativizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_iterativizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/iterativizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return iterativizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatIterativizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatIterativizabilityRolloutCheckStatus(
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

export function formatIterativizabilityAdminAction(action: 'refresh_iterativizability_summary') {
  switch (action) {
    case 'refresh_iterativizability_summary':
      return 'Refresh iterativizability summary'
  }
}

export function formatIterativizabilityDomain(
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

export async function fetchIterativizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/iterativizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return iterativizabilityCapabilitiesResponseSchema.parse(await response.json())
}
