import {
  composabilizabilityAdminActionResponseSchema,
  composabilizabilityAdminSummaryResponseSchema,
  composabilizabilityCapabilitiesResponseSchema,
  composabilizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchComposabilizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/composabilizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return composabilizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchComposabilizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/composabilizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return composabilizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeComposabilizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_composabilizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/composabilizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return composabilizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatComposabilizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatComposabilizabilityRolloutCheckStatus(
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

export function formatComposabilizabilityAdminAction(action: 'refresh_composabilizability_summary') {
  switch (action) {
    case 'refresh_composabilizability_summary':
      return 'Refresh composabilizability summary'
  }
}

export function formatComposabilizabilityDomain(
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

export async function fetchComposabilizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/composabilizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return composabilizabilityCapabilitiesResponseSchema.parse(await response.json())
}
