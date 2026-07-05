import {
  dispatchizabilityAdminActionResponseSchema,
  dispatchizabilityAdminSummaryResponseSchema,
  dispatchizabilityCapabilitiesResponseSchema,
  dispatchizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDispatchizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/dispatchizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return dispatchizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDispatchizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/dispatchizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return dispatchizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDispatchizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_dispatchizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/dispatchizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return dispatchizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDispatchizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDispatchizabilityRolloutCheckStatus(
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

export function formatDispatchizabilityAdminAction(action: 'refresh_dispatchizability_summary') {
  switch (action) {
    case 'refresh_dispatchizability_summary':
      return 'Refresh dispatchizability summary'
  }
}

export function formatDispatchizabilityDomain(
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

export async function fetchDispatchizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/dispatchizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return dispatchizabilityCapabilitiesResponseSchema.parse(await response.json())
}
