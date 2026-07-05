import {
  upgradizabilityAdminActionResponseSchema,
  upgradizabilityAdminSummaryResponseSchema,
  upgradizabilityCapabilitiesResponseSchema,
  upgradizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchUpgradizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/upgradizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return upgradizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchUpgradizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/upgradizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return upgradizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeUpgradizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_upgradizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/upgradizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return upgradizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatUpgradizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatUpgradizabilityRolloutCheckStatus(
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

export function formatUpgradizabilityAdminAction(action: 'refresh_upgradizability_summary') {
  switch (action) {
    case 'refresh_upgradizability_summary':
      return 'Refresh upgradizability summary'
  }
}

export function formatUpgradizabilityDomain(
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

export async function fetchUpgradizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/upgradizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return upgradizabilityCapabilitiesResponseSchema.parse(await response.json())
}
