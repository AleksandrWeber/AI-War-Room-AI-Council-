import {
  adaptizabilityAdminActionResponseSchema,
  adaptizabilityAdminSummaryResponseSchema,
  adaptizabilityCapabilitiesResponseSchema,
  adaptizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAdaptizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/adaptizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return adaptizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAdaptizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/adaptizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return adaptizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAdaptizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_adaptizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/adaptizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return adaptizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAdaptizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAdaptizabilityRolloutCheckStatus(
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

export function formatAdaptizabilityAdminAction(action: 'refresh_adaptizability_summary') {
  switch (action) {
    case 'refresh_adaptizability_summary':
      return 'Refresh adaptizability summary'
  }
}

export function formatAdaptizabilityDomain(
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

export async function fetchAdaptizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/adaptizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return adaptizabilityCapabilitiesResponseSchema.parse(await response.json())
}
