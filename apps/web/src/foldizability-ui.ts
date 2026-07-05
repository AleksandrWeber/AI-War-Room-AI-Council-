import {
  foldizabilityAdminActionResponseSchema,
  foldizabilityAdminSummaryResponseSchema,
  foldizabilityCapabilitiesResponseSchema,
  foldizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchFoldizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/foldizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return foldizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchFoldizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/foldizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return foldizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeFoldizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_foldizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/foldizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return foldizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatFoldizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatFoldizabilityRolloutCheckStatus(
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

export function formatFoldizabilityAdminAction(action: 'refresh_foldizability_summary') {
  switch (action) {
    case 'refresh_foldizability_summary':
      return 'Refresh foldizability summary'
  }
}

export function formatFoldizabilityDomain(
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

export async function fetchFoldizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/foldizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return foldizabilityCapabilitiesResponseSchema.parse(await response.json())
}
