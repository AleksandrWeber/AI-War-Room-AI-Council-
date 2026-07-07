import {
  evidencizabilityAdminActionResponseSchema,
  evidencizabilityAdminSummaryResponseSchema,
  evidencizabilityCapabilitiesResponseSchema,
  evidencizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchEvidencizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/evidencizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return evidencizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchEvidencizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/evidencizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return evidencizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeEvidencizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_evidencizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/evidencizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return evidencizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatEvidencizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatEvidencizabilityRolloutCheckStatus(
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

export function formatEvidencizabilityAdminAction(action: 'refresh_evidencizability_summary') {
  switch (action) {
    case 'refresh_evidencizability_summary':
      return 'Refresh evidencizability summary'
  }
}

export function formatEvidencizabilityDomain(
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

export async function fetchEvidencizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/evidencizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return evidencizabilityCapabilitiesResponseSchema.parse(await response.json())
}
