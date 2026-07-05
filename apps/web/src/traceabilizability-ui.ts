import {
  traceabilizabilityAdminActionResponseSchema,
  traceabilizabilityAdminSummaryResponseSchema,
  traceabilizabilityCapabilitiesResponseSchema,
  traceabilizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTraceabilizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/traceabilizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return traceabilizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchTraceabilizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/traceabilizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return traceabilizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTraceabilizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_traceabilizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/traceabilizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return traceabilizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatTraceabilizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTraceabilizabilityRolloutCheckStatus(
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

export function formatTraceabilizabilityAdminAction(action: 'refresh_traceabilizability_summary') {
  switch (action) {
    case 'refresh_traceabilizability_summary':
      return 'Refresh traceabilizability summary'
  }
}

export function formatTraceabilizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'idempotency_keys' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'idempotency_keys':
      return 'Idempotency keys'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchTraceabilizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/traceabilizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return traceabilizabilityCapabilitiesResponseSchema.parse(await response.json())
}
