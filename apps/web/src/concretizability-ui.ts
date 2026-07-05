import {
  concretizabilityAdminActionResponseSchema,
  concretizabilityAdminSummaryResponseSchema,
  concretizabilityCapabilitiesResponseSchema,
  concretizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchConcretizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/concretizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return concretizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchConcretizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/concretizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return concretizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeConcretizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_concretizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/concretizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return concretizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatConcretizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatConcretizabilityRolloutCheckStatus(
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

export function formatConcretizabilityAdminAction(action: 'refresh_concretizability_summary') {
  switch (action) {
    case 'refresh_concretizability_summary':
      return 'Refresh concretizability summary'
  }
}

export function formatConcretizabilityDomain(
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

export async function fetchConcretizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/concretizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return concretizabilityCapabilitiesResponseSchema.parse(await response.json())
}
