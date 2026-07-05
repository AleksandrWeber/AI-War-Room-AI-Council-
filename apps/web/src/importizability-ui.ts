import {
  importizabilityAdminActionResponseSchema,
  importizabilityAdminSummaryResponseSchema,
  importizabilityCapabilitiesResponseSchema,
  importizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchImportizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/importizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return importizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchImportizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/importizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return importizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeImportizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_importizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/importizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return importizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatImportizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatImportizabilityRolloutCheckStatus(
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

export function formatImportizabilityAdminAction(action: 'refresh_importizability_summary') {
  switch (action) {
    case 'refresh_importizability_summary':
      return 'Refresh importizability summary'
  }
}

export function formatImportizabilityDomain(
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

export async function fetchImportizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/importizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return importizabilityCapabilitiesResponseSchema.parse(await response.json())
}
