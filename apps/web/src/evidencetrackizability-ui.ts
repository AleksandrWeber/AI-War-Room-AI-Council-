import {
  evidencetrackizabilityAdminActionResponseSchema,
  evidencetrackizabilityAdminSummaryResponseSchema,
  evidencetrackizabilityCapabilitiesResponseSchema,
  evidencetrackizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchEvidencetrackizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/evidencetrackizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return evidencetrackizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchEvidencetrackizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/evidencetrackizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return evidencetrackizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeEvidencetrackizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_evidencetrackizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/evidencetrackizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return evidencetrackizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatEvidencetrackizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatEvidencetrackizabilityRolloutCheckStatus(
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

export function formatEvidencetrackizabilityAdminAction(action: 'refresh_evidencetrackizability_summary') {
  switch (action) {
    case 'refresh_evidencetrackizability_summary':
      return 'Refresh evidencetrackizability summary'
  }
}

export function formatEvidencetrackizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'idempotency_keys' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'idempotency_keys':
      return 'Idempotency keys'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchEvidencetrackizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/evidencetrackizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return evidencetrackizabilityCapabilitiesResponseSchema.parse(await response.json())
}
