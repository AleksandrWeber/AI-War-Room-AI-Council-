import {
  meshingizabilityAdminActionResponseSchema,
  meshingizabilityAdminSummaryResponseSchema,
  meshingizabilityCapabilitiesResponseSchema,
  meshingizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchMeshingizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/meshingizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return meshingizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchMeshingizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/meshingizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return meshingizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeMeshingizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_meshingizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/meshingizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return meshingizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatMeshingizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatMeshingizabilityRolloutCheckStatus(
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

export function formatMeshingizabilityAdminAction(action: 'refresh_meshingizability_summary') {
  switch (action) {
    case 'refresh_meshingizability_summary':
      return 'Refresh meshingizability summary'
  }
}

export function formatMeshingizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_notifications' | 'billing_webhook_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_notifications':
      return 'Billing notifications'
    case 'billing_webhook_events':
      return 'Billing webhook events'
  }
}

export async function fetchMeshingizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/meshingizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return meshingizabilityCapabilitiesResponseSchema.parse(await response.json())
}
