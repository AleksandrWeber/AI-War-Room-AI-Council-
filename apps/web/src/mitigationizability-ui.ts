import {
  mitigationizabilityAdminActionResponseSchema,
  mitigationizabilityAdminSummaryResponseSchema,
  mitigationizabilityCapabilitiesResponseSchema,
  mitigationizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchMitigationizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/mitigationizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return mitigationizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchMitigationizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/mitigationizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return mitigationizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeMitigationizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_mitigationizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/mitigationizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return mitigationizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatMitigationizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatMitigationizabilityRolloutCheckStatus(
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

export function formatMitigationizabilityAdminAction(action: 'refresh_mitigationizability_summary') {
  switch (action) {
    case 'refresh_mitigationizability_summary':
      return 'Refresh mitigationizability summary'
  }
}

export function formatMitigationizabilityDomain(
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

export async function fetchMitigationizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/mitigationizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return mitigationizabilityCapabilitiesResponseSchema.parse(await response.json())
}
