import {
  warmizabilityAdminActionResponseSchema,
  warmizabilityAdminSummaryResponseSchema,
  warmizabilityCapabilitiesResponseSchema,
  warmizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchWarmizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/warmizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return warmizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchWarmizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/warmizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return warmizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeWarmizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_warmizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/warmizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return warmizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatWarmizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatWarmizabilityRolloutCheckStatus(
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

export function formatWarmizabilityAdminAction(action: 'refresh_warmizability_summary') {
  switch (action) {
    case 'refresh_warmizability_summary':
      return 'Refresh warmizability summary'
  }
}

export function formatWarmizabilityDomain(
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

export async function fetchWarmizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/warmizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return warmizabilityCapabilitiesResponseSchema.parse(await response.json())
}
