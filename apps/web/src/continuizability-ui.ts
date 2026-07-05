import {
  continuizabilityAdminActionResponseSchema,
  continuizabilityAdminSummaryResponseSchema,
  continuizabilityCapabilitiesResponseSchema,
  continuizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchContinuizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/continuizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return continuizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchContinuizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/continuizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return continuizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeContinuizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_continuizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/continuizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return continuizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatContinuizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatContinuizabilityRolloutCheckStatus(
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

export function formatContinuizabilityAdminAction(action: 'refresh_continuizability_summary') {
  switch (action) {
    case 'refresh_continuizability_summary':
      return 'Refresh continuizability summary'
  }
}

export function formatContinuizabilityDomain(
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

export async function fetchContinuizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/continuizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return continuizabilityCapabilitiesResponseSchema.parse(await response.json())
}
