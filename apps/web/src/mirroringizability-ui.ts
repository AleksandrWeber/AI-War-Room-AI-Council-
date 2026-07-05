import {
  mirroringizabilityAdminActionResponseSchema,
  mirroringizabilityAdminSummaryResponseSchema,
  mirroringizabilityCapabilitiesResponseSchema,
  mirroringizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchMirroringizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/mirroringizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return mirroringizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchMirroringizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/mirroringizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return mirroringizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeMirroringizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_mirroringizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/mirroringizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return mirroringizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatMirroringizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatMirroringizabilityRolloutCheckStatus(
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

export function formatMirroringizabilityAdminAction(action: 'refresh_mirroringizability_summary') {
  switch (action) {
    case 'refresh_mirroringizability_summary':
      return 'Refresh mirroringizability summary'
  }
}

export function formatMirroringizabilityDomain(
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

export async function fetchMirroringizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/mirroringizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return mirroringizabilityCapabilitiesResponseSchema.parse(await response.json())
}
