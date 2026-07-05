import {
  historizabilityAdminActionResponseSchema,
  historizabilityAdminSummaryResponseSchema,
  historizabilityCapabilitiesResponseSchema,
  historizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchHistorizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/historizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return historizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchHistorizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/historizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return historizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeHistorizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_historizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/historizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return historizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatHistorizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatHistorizabilityRolloutCheckStatus(
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

export function formatHistorizabilityAdminAction(action: 'refresh_historizability_summary') {
  switch (action) {
    case 'refresh_historizability_summary':
      return 'Refresh historizability summary'
  }
}

export function formatHistorizabilityDomain(
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

export async function fetchHistorizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/historizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return historizabilityCapabilitiesResponseSchema.parse(await response.json())
}
