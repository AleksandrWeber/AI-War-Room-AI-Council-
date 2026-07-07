import {
  privacyizabilityAdminActionResponseSchema,
  privacyizabilityAdminSummaryResponseSchema,
  privacyizabilityCapabilitiesResponseSchema,
  privacyizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchPrivacyizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/privacyizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return privacyizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchPrivacyizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/privacyizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return privacyizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executePrivacyizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_privacyizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/privacyizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return privacyizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatPrivacyizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatPrivacyizabilityRolloutCheckStatus(
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

export function formatPrivacyizabilityAdminAction(action: 'refresh_privacyizability_summary') {
  switch (action) {
    case 'refresh_privacyizability_summary':
      return 'Refresh privacyizability summary'
  }
}

export function formatPrivacyizabilityDomain(
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

export async function fetchPrivacyizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/privacyizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return privacyizabilityCapabilitiesResponseSchema.parse(await response.json())
}
