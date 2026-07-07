import {
  allocationizabilityAdminActionResponseSchema,
  allocationizabilityAdminSummaryResponseSchema,
  allocationizabilityCapabilitiesResponseSchema,
  allocationizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAllocationizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/allocationizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return allocationizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAllocationizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/allocationizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return allocationizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAllocationizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_allocationizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/allocationizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return allocationizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAllocationizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAllocationizabilityRolloutCheckStatus(
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

export function formatAllocationizabilityAdminAction(action: 'refresh_allocationizability_summary') {
  switch (action) {
    case 'refresh_allocationizability_summary':
      return 'Refresh allocationizability summary'
  }
}

export function formatAllocationizabilityDomain(
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

export async function fetchAllocationizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/allocationizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return allocationizabilityCapabilitiesResponseSchema.parse(await response.json())
}
