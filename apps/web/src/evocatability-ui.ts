import {
  evocatabilityAdminActionResponseSchema,
  evocatabilityAdminSummaryResponseSchema,
  evocatabilityCapabilitiesResponseSchema,
  evocatabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchEvocatabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/evocatability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return evocatabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchEvocatabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/evocatability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return evocatabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeEvocatabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_evocatability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/evocatability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return evocatabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatEvocatabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatEvocatabilityRolloutCheckStatus(
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

export function formatEvocatabilityAdminAction(action: 'refresh_evocatability_summary') {
  switch (action) {
    case 'refresh_evocatability_summary':
      return 'Refresh evocatability summary'
  }
}

export function formatEvocatabilityDomain(
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

export async function fetchEvocatabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/evocatability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return evocatabilityCapabilitiesResponseSchema.parse(await response.json())
}
