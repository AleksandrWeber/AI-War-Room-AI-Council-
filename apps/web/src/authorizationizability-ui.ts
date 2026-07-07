import {
  authorizationizabilityAdminActionResponseSchema,
  authorizationizabilityAdminSummaryResponseSchema,
  authorizationizabilityCapabilitiesResponseSchema,
  authorizationizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAuthorizationizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/authorizationizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return authorizationizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAuthorizationizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/authorizationizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return authorizationizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAuthorizationizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_authorizationizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/authorizationizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return authorizationizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAuthorizationizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAuthorizationizabilityRolloutCheckStatus(
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

export function formatAuthorizationizabilityAdminAction(action: 'refresh_authorizationizability_summary') {
  switch (action) {
    case 'refresh_authorizationizability_summary':
      return 'Refresh authorizationizability summary'
  }
}

export function formatAuthorizationizabilityDomain(
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

export async function fetchAuthorizationizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/authorizationizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return authorizationizabilityCapabilitiesResponseSchema.parse(await response.json())
}
