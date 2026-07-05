import {
  traceabilityAdminActionResponseSchema,
  traceabilityAdminSummaryResponseSchema,
  traceabilityCapabilitiesResponseSchema,
  traceabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTraceabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/traceability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return traceabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchTraceabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/traceability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return traceabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTraceabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_traceability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/traceability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return traceabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatTraceabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTraceabilityRolloutCheckStatus(
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

export function formatTraceabilityAdminAction(
  action: 'refresh_traceability_summary',
) {
  switch (action) {
    case 'refresh_traceability_summary':
      return 'Refresh traceability summary'
  }
}

export function formatTraceabilityDomain(
  domain:
    | 'completed_runs'
    | 'failed_runs'
    | 'artifacts'
    | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'artifacts':
      return 'Artifacts'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchTraceabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/traceability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return traceabilityCapabilitiesResponseSchema.parse(await response.json())
}
