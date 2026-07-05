import {
  simulatizabilityAdminActionResponseSchema,
  simulatizabilityAdminSummaryResponseSchema,
  simulatizabilityCapabilitiesResponseSchema,
  simulatizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSimulatizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/simulatizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return simulatizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSimulatizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/simulatizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return simulatizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSimulatizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_simulatizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/simulatizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return simulatizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSimulatizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSimulatizabilityRolloutCheckStatus(
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

export function formatSimulatizabilityAdminAction(action: 'refresh_simulatizability_summary') {
  switch (action) {
    case 'refresh_simulatizability_summary':
      return 'Refresh simulatizability summary'
  }
}

export function formatSimulatizabilityDomain(
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

export async function fetchSimulatizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/simulatizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return simulatizabilityCapabilitiesResponseSchema.parse(await response.json())
}
