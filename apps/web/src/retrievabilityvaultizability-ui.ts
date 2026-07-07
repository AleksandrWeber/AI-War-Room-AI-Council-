import {
  retrievabilityvaultizabilityAdminActionResponseSchema,
  retrievabilityvaultizabilityAdminSummaryResponseSchema,
  retrievabilityvaultizabilityCapabilitiesResponseSchema,
  retrievabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRetrievabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/retrievabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return retrievabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRetrievabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/retrievabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return retrievabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRetrievabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_retrievabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/retrievabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return retrievabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRetrievabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRetrievabilityvaultizabilityRolloutCheckStatus(
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

export function formatRetrievabilityvaultizabilityAdminAction(action: 'refresh_retrievabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_retrievabilityvaultizability_summary':
      return 'Refresh retrievabilityvaultizability summary'
  }
}

export function formatRetrievabilityvaultizabilityDomain(
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

export async function fetchRetrievabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/retrievabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return retrievabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
