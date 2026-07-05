import {
  materializationizabilityAdminActionResponseSchema,
  materializationizabilityAdminSummaryResponseSchema,
  materializationizabilityCapabilitiesResponseSchema,
  materializationizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchMaterializationizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/materializationizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return materializationizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchMaterializationizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/materializationizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return materializationizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeMaterializationizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_materializationizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/materializationizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return materializationizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatMaterializationizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatMaterializationizabilityRolloutCheckStatus(
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

export function formatMaterializationizabilityAdminAction(action: 'refresh_materializationizability_summary') {
  switch (action) {
    case 'refresh_materializationizability_summary':
      return 'Refresh materializationizability summary'
  }
}

export function formatMaterializationizabilityDomain(
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

export async function fetchMaterializationizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/materializationizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return materializationizabilityCapabilitiesResponseSchema.parse(await response.json())
}
