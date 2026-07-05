import {
  modifiabilityAdminActionResponseSchema,
  modifiabilityAdminSummaryResponseSchema,
  modifiabilityCapabilitiesResponseSchema,
  modifiabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchModifiabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/modifiability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return modifiabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchModifiabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/modifiability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return modifiabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeModifiabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_modifiability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/modifiability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return modifiabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatModifiabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatModifiabilityRolloutCheckStatus(
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

export function formatModifiabilityAdminAction(action: 'refresh_modifiability_summary') {
  switch (action) {
    case 'refresh_modifiability_summary':
      return 'Refresh modifiability summary'
  }
}

export function formatModifiabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'idempotency_keys' | 'workspace_memberships',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'idempotency_keys':
      return 'Idempotency keys'
    case 'workspace_memberships':
      return 'Workspace memberships'
  }
}

export async function fetchModifiabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/modifiability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return modifiabilityCapabilitiesResponseSchema.parse(await response.json())
}
