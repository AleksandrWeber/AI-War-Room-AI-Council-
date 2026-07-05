import {
  protocolizabilityAdminActionResponseSchema,
  protocolizabilityAdminSummaryResponseSchema,
  protocolizabilityCapabilitiesResponseSchema,
  protocolizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchProtocolizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/protocolizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return protocolizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchProtocolizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/protocolizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return protocolizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeProtocolizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_protocolizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/protocolizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return protocolizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatProtocolizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatProtocolizabilityRolloutCheckStatus(
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

export function formatProtocolizabilityAdminAction(action: 'refresh_protocolizability_summary') {
  switch (action) {
    case 'refresh_protocolizability_summary':
      return 'Refresh protocolizability summary'
  }
}

export function formatProtocolizabilityDomain(
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

export async function fetchProtocolizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/protocolizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return protocolizabilityCapabilitiesResponseSchema.parse(await response.json())
}
