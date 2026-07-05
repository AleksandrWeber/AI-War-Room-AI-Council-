import {
  interoperabilizabilityAdminActionResponseSchema,
  interoperabilizabilityAdminSummaryResponseSchema,
  interoperabilizabilityCapabilitiesResponseSchema,
  interoperabilizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchInteroperabilizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/interoperabilizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return interoperabilizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchInteroperabilizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/interoperabilizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return interoperabilizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeInteroperabilizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_interoperabilizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/interoperabilizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return interoperabilizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatInteroperabilizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatInteroperabilizabilityRolloutCheckStatus(
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

export function formatInteroperabilizabilityAdminAction(action: 'refresh_interoperabilizability_summary') {
  switch (action) {
    case 'refresh_interoperabilizability_summary':
      return 'Refresh interoperabilizability summary'
  }
}

export function formatInteroperabilizabilityDomain(
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

export async function fetchInteroperabilizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/interoperabilizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return interoperabilizabilityCapabilitiesResponseSchema.parse(await response.json())
}
