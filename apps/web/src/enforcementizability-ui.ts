import {
  enforcementizabilityAdminActionResponseSchema,
  enforcementizabilityAdminSummaryResponseSchema,
  enforcementizabilityCapabilitiesResponseSchema,
  enforcementizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchEnforcementizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/enforcementizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return enforcementizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchEnforcementizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/enforcementizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return enforcementizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeEnforcementizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_enforcementizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/enforcementizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return enforcementizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatEnforcementizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatEnforcementizabilityRolloutCheckStatus(
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

export function formatEnforcementizabilityAdminAction(action: 'refresh_enforcementizability_summary') {
  switch (action) {
    case 'refresh_enforcementizability_summary':
      return 'Refresh enforcementizability summary'
  }
}

export function formatEnforcementizabilityDomain(
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

export async function fetchEnforcementizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/enforcementizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return enforcementizabilityCapabilitiesResponseSchema.parse(await response.json())
}
