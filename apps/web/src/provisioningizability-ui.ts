import {
  provisioningizabilityAdminActionResponseSchema,
  provisioningizabilityAdminSummaryResponseSchema,
  provisioningizabilityCapabilitiesResponseSchema,
  provisioningizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchProvisioningizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/provisioningizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return provisioningizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchProvisioningizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/provisioningizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return provisioningizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeProvisioningizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_provisioningizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/provisioningizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return provisioningizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatProvisioningizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatProvisioningizabilityRolloutCheckStatus(
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

export function formatProvisioningizabilityAdminAction(action: 'refresh_provisioningizability_summary') {
  switch (action) {
    case 'refresh_provisioningizability_summary':
      return 'Refresh provisioningizability summary'
  }
}

export function formatProvisioningizabilityDomain(
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

export async function fetchProvisioningizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/provisioningizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return provisioningizabilityCapabilitiesResponseSchema.parse(await response.json())
}
