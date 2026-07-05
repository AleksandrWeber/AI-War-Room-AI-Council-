import {
  sustainizabilityAdminActionResponseSchema,
  sustainizabilityAdminSummaryResponseSchema,
  sustainizabilityCapabilitiesResponseSchema,
  sustainizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSustainizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/sustainizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return sustainizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSustainizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/sustainizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return sustainizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSustainizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_sustainizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/sustainizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return sustainizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSustainizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSustainizabilityRolloutCheckStatus(
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

export function formatSustainizabilityAdminAction(action: 'refresh_sustainizability_summary') {
  switch (action) {
    case 'refresh_sustainizability_summary':
      return 'Refresh sustainizability summary'
  }
}

export function formatSustainizabilityDomain(
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

export async function fetchSustainizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/sustainizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return sustainizabilityCapabilitiesResponseSchema.parse(await response.json())
}
