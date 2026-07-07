import {
  demonstrabilityvaultizabilityAdminActionResponseSchema,
  demonstrabilityvaultizabilityAdminSummaryResponseSchema,
  demonstrabilityvaultizabilityCapabilitiesResponseSchema,
  demonstrabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDemonstrabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/demonstrabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return demonstrabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDemonstrabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/demonstrabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return demonstrabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDemonstrabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_demonstrabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/demonstrabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return demonstrabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDemonstrabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDemonstrabilityvaultizabilityRolloutCheckStatus(
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

export function formatDemonstrabilityvaultizabilityAdminAction(action: 'refresh_demonstrabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_demonstrabilityvaultizability_summary':
      return 'Refresh demonstrabilityvaultizability summary'
  }
}

export function formatDemonstrabilityvaultizabilityDomain(
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

export async function fetchDemonstrabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/demonstrabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return demonstrabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
