import {
  abductizabilityAdminActionResponseSchema,
  abductizabilityAdminSummaryResponseSchema,
  abductizabilityCapabilitiesResponseSchema,
  abductizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAbductizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/abductizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return abductizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAbductizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/abductizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return abductizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAbductizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_abductizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/abductizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return abductizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAbductizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAbductizabilityRolloutCheckStatus(
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

export function formatAbductizabilityAdminAction(action: 'refresh_abductizability_summary') {
  switch (action) {
    case 'refresh_abductizability_summary':
      return 'Refresh abductizability summary'
  }
}

export function formatAbductizabilityDomain(
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

export async function fetchAbductizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/abductizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return abductizabilityCapabilitiesResponseSchema.parse(await response.json())
}
