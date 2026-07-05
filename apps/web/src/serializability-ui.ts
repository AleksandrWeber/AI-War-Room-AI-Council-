import {
  serializabilityAdminActionResponseSchema,
  serializabilityAdminSummaryResponseSchema,
  serializabilityCapabilitiesResponseSchema,
  serializabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSerializabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/serializability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return serializabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSerializabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/serializability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return serializabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSerializabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_serializability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/serializability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return serializabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSerializabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSerializabilityRolloutCheckStatus(
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

export function formatSerializabilityAdminAction(action: 'refresh_serializability_summary') {
  switch (action) {
    case 'refresh_serializability_summary':
      return 'Refresh serializability summary'
  }
}

export function formatSerializabilityDomain(
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

export async function fetchSerializabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/serializability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return serializabilityCapabilitiesResponseSchema.parse(await response.json())
}
