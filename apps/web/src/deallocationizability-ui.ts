import {
  deallocationizabilityAdminActionResponseSchema,
  deallocationizabilityAdminSummaryResponseSchema,
  deallocationizabilityCapabilitiesResponseSchema,
  deallocationizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDeallocationizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/deallocationizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deallocationizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDeallocationizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/deallocationizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deallocationizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDeallocationizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_deallocationizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/deallocationizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return deallocationizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDeallocationizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDeallocationizabilityRolloutCheckStatus(
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

export function formatDeallocationizabilityAdminAction(action: 'refresh_deallocationizability_summary') {
  switch (action) {
    case 'refresh_deallocationizability_summary':
      return 'Refresh deallocationizability summary'
  }
}

export function formatDeallocationizabilityDomain(
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

export async function fetchDeallocationizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/deallocationizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deallocationizabilityCapabilitiesResponseSchema.parse(await response.json())
}
