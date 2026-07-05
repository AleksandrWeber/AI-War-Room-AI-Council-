import {
  deliverizabilityAdminActionResponseSchema,
  deliverizabilityAdminSummaryResponseSchema,
  deliverizabilityCapabilitiesResponseSchema,
  deliverizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDeliverizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/deliverizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deliverizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDeliverizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/deliverizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deliverizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDeliverizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_deliverizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/deliverizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return deliverizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDeliverizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDeliverizabilityRolloutCheckStatus(
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

export function formatDeliverizabilityAdminAction(action: 'refresh_deliverizability_summary') {
  switch (action) {
    case 'refresh_deliverizability_summary':
      return 'Refresh deliverizability summary'
  }
}

export function formatDeliverizabilityDomain(
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

export async function fetchDeliverizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/deliverizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deliverizabilityCapabilitiesResponseSchema.parse(await response.json())
}
