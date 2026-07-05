import {
  connotabilityAdminActionResponseSchema,
  connotabilityAdminSummaryResponseSchema,
  connotabilityCapabilitiesResponseSchema,
  connotabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchConnotabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/connotability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return connotabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchConnotabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/connotability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return connotabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeConnotabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_connotability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/connotability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return connotabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatConnotabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatConnotabilityRolloutCheckStatus(
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

export function formatConnotabilityAdminAction(action: 'refresh_connotability_summary') {
  switch (action) {
    case 'refresh_connotability_summary':
      return 'Refresh connotability summary'
  }
}

export function formatConnotabilityDomain(
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

export async function fetchConnotabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/connotability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return connotabilityCapabilitiesResponseSchema.parse(await response.json())
}
