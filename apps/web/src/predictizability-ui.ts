import {
  predictizabilityAdminActionResponseSchema,
  predictizabilityAdminSummaryResponseSchema,
  predictizabilityCapabilitiesResponseSchema,
  predictizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchPredictizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/predictizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return predictizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchPredictizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/predictizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return predictizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executePredictizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_predictizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/predictizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return predictizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatPredictizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatPredictizabilityRolloutCheckStatus(
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

export function formatPredictizabilityAdminAction(action: 'refresh_predictizability_summary') {
  switch (action) {
    case 'refresh_predictizability_summary':
      return 'Refresh predictizability summary'
  }
}

export function formatPredictizabilityDomain(
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

export async function fetchPredictizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/predictizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return predictizabilityCapabilitiesResponseSchema.parse(await response.json())
}
