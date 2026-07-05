import {
  deployabilityAdminActionResponseSchema,
  deployabilityAdminSummaryResponseSchema,
  deployabilityCapabilitiesResponseSchema,
  deployabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDeployabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/deployability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deployabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDeployabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/deployability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deployabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDeployabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_deployability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/deployability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return deployabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDeployabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDeployabilityRolloutCheckStatus(
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

export function formatDeployabilityAdminAction(action: 'refresh_deployability_summary') {
  switch (action) {
    case 'refresh_deployability_summary':
      return 'Refresh deployability summary'
  }
}

export function formatDeployabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_provider_credentials' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_provider_credentials':
      return 'Provider credentials'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchDeployabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/deployability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deployabilityCapabilitiesResponseSchema.parse(await response.json())
}
