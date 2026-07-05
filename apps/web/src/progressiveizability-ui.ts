import {
  progressiveizabilityAdminActionResponseSchema,
  progressiveizabilityAdminSummaryResponseSchema,
  progressiveizabilityCapabilitiesResponseSchema,
  progressiveizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchProgressiveizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/progressiveizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return progressiveizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchProgressiveizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/progressiveizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return progressiveizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeProgressiveizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_progressiveizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/progressiveizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return progressiveizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatProgressiveizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatProgressiveizabilityRolloutCheckStatus(
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

export function formatProgressiveizabilityAdminAction(action: 'refresh_progressiveizability_summary') {
  switch (action) {
    case 'refresh_progressiveizability_summary':
      return 'Refresh progressiveizability summary'
  }
}

export function formatProgressiveizabilityDomain(
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

export async function fetchProgressiveizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/progressiveizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return progressiveizabilityCapabilitiesResponseSchema.parse(await response.json())
}
