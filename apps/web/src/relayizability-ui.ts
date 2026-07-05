import {
  relayizabilityAdminActionResponseSchema,
  relayizabilityAdminSummaryResponseSchema,
  relayizabilityCapabilitiesResponseSchema,
  relayizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRelayizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/relayizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return relayizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRelayizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/relayizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return relayizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRelayizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_relayizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/relayizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return relayizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRelayizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRelayizabilityRolloutCheckStatus(
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

export function formatRelayizabilityAdminAction(action: 'refresh_relayizability_summary') {
  switch (action) {
    case 'refresh_relayizability_summary':
      return 'Refresh relayizability summary'
  }
}

export function formatRelayizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'model_health_events' | 'billing_records',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'model_health_events':
      return 'Model health events'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchRelayizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/relayizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return relayizabilityCapabilitiesResponseSchema.parse(await response.json())
}
