import {
  debouncizabilityAdminActionResponseSchema,
  debouncizabilityAdminSummaryResponseSchema,
  debouncizabilityCapabilitiesResponseSchema,
  debouncizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDebouncizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/debouncizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return debouncizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDebouncizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/debouncizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return debouncizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDebouncizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_debouncizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/debouncizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return debouncizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDebouncizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDebouncizabilityRolloutCheckStatus(
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

export function formatDebouncizabilityAdminAction(action: 'refresh_debouncizability_summary') {
  switch (action) {
    case 'refresh_debouncizability_summary':
      return 'Refresh debouncizability summary'
  }
}

export function formatDebouncizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'model_health_events' | 'billing_records',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'model_health_events':
      return 'Model health events'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchDebouncizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/debouncizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return debouncizabilityCapabilitiesResponseSchema.parse(await response.json())
}
