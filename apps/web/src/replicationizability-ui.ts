import {
  replicationizabilityAdminActionResponseSchema,
  replicationizabilityAdminSummaryResponseSchema,
  replicationizabilityCapabilitiesResponseSchema,
  replicationizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchReplicationizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/replicationizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return replicationizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchReplicationizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/replicationizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return replicationizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeReplicationizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_replicationizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/replicationizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return replicationizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatReplicationizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatReplicationizabilityRolloutCheckStatus(
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

export function formatReplicationizabilityAdminAction(action: 'refresh_replicationizability_summary') {
  switch (action) {
    case 'refresh_replicationizability_summary':
      return 'Refresh replicationizability summary'
  }
}

export function formatReplicationizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_webhook_events' | 'billing_records',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_webhook_events':
      return 'Billing webhook events'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchReplicationizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/replicationizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return replicationizabilityCapabilitiesResponseSchema.parse(await response.json())
}
