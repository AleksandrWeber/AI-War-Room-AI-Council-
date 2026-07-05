import {
  brokerizabilityAdminActionResponseSchema,
  brokerizabilityAdminSummaryResponseSchema,
  brokerizabilityCapabilitiesResponseSchema,
  brokerizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchBrokerizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/brokerizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return brokerizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchBrokerizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/brokerizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return brokerizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeBrokerizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_brokerizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/brokerizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return brokerizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatBrokerizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatBrokerizabilityRolloutCheckStatus(
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

export function formatBrokerizabilityAdminAction(action: 'refresh_brokerizability_summary') {
  switch (action) {
    case 'refresh_brokerizability_summary':
      return 'Refresh brokerizability summary'
  }
}

export function formatBrokerizabilityDomain(
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

export async function fetchBrokerizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/brokerizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return brokerizabilityCapabilitiesResponseSchema.parse(await response.json())
}
