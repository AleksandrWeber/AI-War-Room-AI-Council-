import {
  pipeliningizabilityAdminActionResponseSchema,
  pipeliningizabilityAdminSummaryResponseSchema,
  pipeliningizabilityCapabilitiesResponseSchema,
  pipeliningizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchPipeliningizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/pipeliningizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return pipeliningizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchPipeliningizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/pipeliningizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return pipeliningizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executePipeliningizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_pipeliningizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/pipeliningizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return pipeliningizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatPipeliningizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatPipeliningizabilityRolloutCheckStatus(
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

export function formatPipeliningizabilityAdminAction(action: 'refresh_pipeliningizability_summary') {
  switch (action) {
    case 'refresh_pipeliningizability_summary':
      return 'Refresh pipeliningizability summary'
  }
}

export function formatPipeliningizabilityDomain(
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

export async function fetchPipeliningizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/pipeliningizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return pipeliningizabilityCapabilitiesResponseSchema.parse(await response.json())
}
