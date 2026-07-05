import {
  routingizabilityAdminActionResponseSchema,
  routingizabilityAdminSummaryResponseSchema,
  routingizabilityCapabilitiesResponseSchema,
  routingizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRoutingizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/routingizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return routingizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRoutingizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/routingizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return routingizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRoutingizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_routingizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/routingizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return routingizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRoutingizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRoutingizabilityRolloutCheckStatus(
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

export function formatRoutingizabilityAdminAction(action: 'refresh_routingizability_summary') {
  switch (action) {
    case 'refresh_routingizability_summary':
      return 'Refresh routingizability summary'
  }
}

export function formatRoutingizabilityDomain(
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

export async function fetchRoutingizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/routingizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return routingizabilityCapabilitiesResponseSchema.parse(await response.json())
}
