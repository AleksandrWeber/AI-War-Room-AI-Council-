import {
  decentralizabilityAdminActionResponseSchema,
  decentralizabilityAdminSummaryResponseSchema,
  decentralizabilityCapabilitiesResponseSchema,
  decentralizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDecentralizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/decentralizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return decentralizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDecentralizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/decentralizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return decentralizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDecentralizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_decentralizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/decentralizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return decentralizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDecentralizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDecentralizabilityRolloutCheckStatus(
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

export function formatDecentralizabilityAdminAction(action: 'refresh_decentralizability_summary') {
  switch (action) {
    case 'refresh_decentralizability_summary':
      return 'Refresh decentralizability summary'
  }
}

export function formatDecentralizabilityDomain(
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

export async function fetchDecentralizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/decentralizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return decentralizabilityCapabilitiesResponseSchema.parse(await response.json())
}
