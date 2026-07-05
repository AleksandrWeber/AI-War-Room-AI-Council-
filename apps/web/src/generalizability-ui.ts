import {
  generalizabilityAdminActionResponseSchema,
  generalizabilityAdminSummaryResponseSchema,
  generalizabilityCapabilitiesResponseSchema,
  generalizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchGeneralizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/generalizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return generalizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchGeneralizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/generalizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return generalizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeGeneralizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_generalizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/generalizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return generalizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatGeneralizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatGeneralizabilityRolloutCheckStatus(
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

export function formatGeneralizabilityAdminAction(action: 'refresh_generalizability_summary') {
  switch (action) {
    case 'refresh_generalizability_summary':
      return 'Refresh generalizability summary'
  }
}

export function formatGeneralizabilityDomain(
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

export async function fetchGeneralizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/generalizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return generalizabilityCapabilitiesResponseSchema.parse(await response.json())
}
