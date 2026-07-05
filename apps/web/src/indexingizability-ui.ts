import {
  indexingizabilityAdminActionResponseSchema,
  indexingizabilityAdminSummaryResponseSchema,
  indexingizabilityCapabilitiesResponseSchema,
  indexingizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchIndexingizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/indexingizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return indexingizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchIndexingizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/indexingizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return indexingizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeIndexingizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_indexingizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/indexingizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return indexingizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatIndexingizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatIndexingizabilityRolloutCheckStatus(
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

export function formatIndexingizabilityAdminAction(action: 'refresh_indexingizability_summary') {
  switch (action) {
    case 'refresh_indexingizability_summary':
      return 'Refresh indexingizability summary'
  }
}

export function formatIndexingizabilityDomain(
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

export async function fetchIndexingizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/indexingizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return indexingizabilityCapabilitiesResponseSchema.parse(await response.json())
}
