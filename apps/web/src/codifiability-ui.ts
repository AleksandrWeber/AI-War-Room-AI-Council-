import {
  codifiabilityAdminActionResponseSchema,
  codifiabilityAdminSummaryResponseSchema,
  codifiabilityCapabilitiesResponseSchema,
  codifiabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCodifiabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/codifiability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return codifiabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCodifiabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/codifiability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return codifiabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCodifiabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_codifiability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/codifiability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return codifiabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCodifiabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCodifiabilityRolloutCheckStatus(
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

export function formatCodifiabilityAdminAction(action: 'refresh_codifiability_summary') {
  switch (action) {
    case 'refresh_codifiability_summary':
      return 'Refresh codifiability summary'
  }
}

export function formatCodifiabilityDomain(
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

export async function fetchCodifiabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/codifiability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return codifiabilityCapabilitiesResponseSchema.parse(await response.json())
}
