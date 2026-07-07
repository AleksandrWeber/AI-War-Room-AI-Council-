import {
  evidencejournalizabilityAdminActionResponseSchema,
  evidencejournalizabilityAdminSummaryResponseSchema,
  evidencejournalizabilityCapabilitiesResponseSchema,
  evidencejournalizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchEvidencejournalizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/evidencejournalizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return evidencejournalizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchEvidencejournalizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/evidencejournalizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return evidencejournalizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeEvidencejournalizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_evidencejournalizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/evidencejournalizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return evidencejournalizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatEvidencejournalizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatEvidencejournalizabilityRolloutCheckStatus(
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

export function formatEvidencejournalizabilityAdminAction(action: 'refresh_evidencejournalizability_summary') {
  switch (action) {
    case 'refresh_evidencejournalizability_summary':
      return 'Refresh evidencejournalizability summary'
  }
}

export function formatEvidencejournalizabilityDomain(
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

export async function fetchEvidencejournalizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/evidencejournalizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return evidencejournalizabilityCapabilitiesResponseSchema.parse(await response.json())
}
