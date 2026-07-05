import {
  interfabilizabilityAdminActionResponseSchema,
  interfabilizabilityAdminSummaryResponseSchema,
  interfabilizabilityCapabilitiesResponseSchema,
  interfabilizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchInterfabilizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/interfabilizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return interfabilizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchInterfabilizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/interfabilizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return interfabilizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeInterfabilizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_interfabilizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/interfabilizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return interfabilizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatInterfabilizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatInterfabilizabilityRolloutCheckStatus(
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

export function formatInterfabilizabilityAdminAction(action: 'refresh_interfabilizability_summary') {
  switch (action) {
    case 'refresh_interfabilizability_summary':
      return 'Refresh interfabilizability summary'
  }
}

export function formatInterfabilizabilityDomain(
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

export async function fetchInterfabilizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/interfabilizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return interfabilizabilityCapabilitiesResponseSchema.parse(await response.json())
}
