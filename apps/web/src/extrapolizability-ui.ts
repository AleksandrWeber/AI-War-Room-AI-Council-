import {
  extrapolizabilityAdminActionResponseSchema,
  extrapolizabilityAdminSummaryResponseSchema,
  extrapolizabilityCapabilitiesResponseSchema,
  extrapolizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchExtrapolizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/extrapolizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return extrapolizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchExtrapolizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/extrapolizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return extrapolizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeExtrapolizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_extrapolizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/extrapolizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return extrapolizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatExtrapolizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatExtrapolizabilityRolloutCheckStatus(
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

export function formatExtrapolizabilityAdminAction(action: 'refresh_extrapolizability_summary') {
  switch (action) {
    case 'refresh_extrapolizability_summary':
      return 'Refresh extrapolizability summary'
  }
}

export function formatExtrapolizabilityDomain(
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

export async function fetchExtrapolizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/extrapolizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return extrapolizabilityCapabilitiesResponseSchema.parse(await response.json())
}
