import {
  consensusizabilityAdminActionResponseSchema,
  consensusizabilityAdminSummaryResponseSchema,
  consensusizabilityCapabilitiesResponseSchema,
  consensusizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchConsensusizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/consensusizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return consensusizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchConsensusizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/consensusizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return consensusizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeConsensusizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_consensusizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/consensusizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return consensusizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatConsensusizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatConsensusizabilityRolloutCheckStatus(
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

export function formatConsensusizabilityAdminAction(action: 'refresh_consensusizability_summary') {
  switch (action) {
    case 'refresh_consensusizability_summary':
      return 'Refresh consensusizability summary'
  }
}

export function formatConsensusizabilityDomain(
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

export async function fetchConsensusizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/consensusizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return consensusizabilityCapabilitiesResponseSchema.parse(await response.json())
}
