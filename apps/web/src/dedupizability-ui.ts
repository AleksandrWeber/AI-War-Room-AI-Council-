import {
  dedupizabilityAdminActionResponseSchema,
  dedupizabilityAdminSummaryResponseSchema,
  dedupizabilityCapabilitiesResponseSchema,
  dedupizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDedupizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/dedupizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return dedupizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDedupizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/dedupizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return dedupizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDedupizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_dedupizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/dedupizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return dedupizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDedupizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDedupizabilityRolloutCheckStatus(
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

export function formatDedupizabilityAdminAction(action: 'refresh_dedupizability_summary') {
  switch (action) {
    case 'refresh_dedupizability_summary':
      return 'Refresh dedupizability summary'
  }
}

export function formatDedupizabilityDomain(
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

export async function fetchDedupizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/dedupizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return dedupizabilityCapabilitiesResponseSchema.parse(await response.json())
}
