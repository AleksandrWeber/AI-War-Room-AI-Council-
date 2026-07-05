import {
  aggregatizabilityAdminActionResponseSchema,
  aggregatizabilityAdminSummaryResponseSchema,
  aggregatizabilityCapabilitiesResponseSchema,
  aggregatizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAggregatizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/aggregatizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return aggregatizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAggregatizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/aggregatizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return aggregatizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAggregatizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_aggregatizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/aggregatizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return aggregatizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAggregatizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAggregatizabilityRolloutCheckStatus(
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

export function formatAggregatizabilityAdminAction(action: 'refresh_aggregatizability_summary') {
  switch (action) {
    case 'refresh_aggregatizability_summary':
      return 'Refresh aggregatizability summary'
  }
}

export function formatAggregatizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_provider_credentials' | 'model_registry_entries',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_provider_credentials':
      return 'Provider credentials'
    case 'model_registry_entries':
      return 'Model registry entries'
  }
}

export async function fetchAggregatizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/aggregatizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return aggregatizabilityCapabilitiesResponseSchema.parse(await response.json())
}
