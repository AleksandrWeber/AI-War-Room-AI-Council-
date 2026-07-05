import {
  formulatabilityAdminActionResponseSchema,
  formulatabilityAdminSummaryResponseSchema,
  formulatabilityCapabilitiesResponseSchema,
  formulatabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchFormulatabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/formulatability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return formulatabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchFormulatabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/formulatability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return formulatabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeFormulatabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_formulatability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/formulatability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return formulatabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatFormulatabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatFormulatabilityRolloutCheckStatus(
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

export function formatFormulatabilityAdminAction(action: 'refresh_formulatability_summary') {
  switch (action) {
    case 'refresh_formulatability_summary':
      return 'Refresh formulatability summary'
  }
}

export function formatFormulatabilityDomain(
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

export async function fetchFormulatabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/formulatability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return formulatabilityCapabilitiesResponseSchema.parse(await response.json())
}
