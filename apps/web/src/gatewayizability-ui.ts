import {
  gatewayizabilityAdminActionResponseSchema,
  gatewayizabilityAdminSummaryResponseSchema,
  gatewayizabilityCapabilitiesResponseSchema,
  gatewayizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchGatewayizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/gatewayizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return gatewayizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchGatewayizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/gatewayizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return gatewayizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeGatewayizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_gatewayizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/gatewayizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return gatewayizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatGatewayizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatGatewayizabilityRolloutCheckStatus(
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

export function formatGatewayizabilityAdminAction(action: 'refresh_gatewayizability_summary') {
  switch (action) {
    case 'refresh_gatewayizability_summary':
      return 'Refresh gatewayizability summary'
  }
}

export function formatGatewayizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_usage_limits' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_usage_limits':
      return 'Workspace usage limits'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchGatewayizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/gatewayizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return gatewayizabilityCapabilitiesResponseSchema.parse(await response.json())
}
