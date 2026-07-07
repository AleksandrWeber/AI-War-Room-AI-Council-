import {
  evidencevaultizabilityAdminActionResponseSchema,
  evidencevaultizabilityAdminSummaryResponseSchema,
  evidencevaultizabilityCapabilitiesResponseSchema,
  evidencevaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchEvidencevaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/evidencevaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return evidencevaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchEvidencevaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/evidencevaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return evidencevaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeEvidencevaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_evidencevaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/evidencevaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return evidencevaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatEvidencevaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatEvidencevaultizabilityRolloutCheckStatus(
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

export function formatEvidencevaultizabilityAdminAction(action: 'refresh_evidencevaultizability_summary') {
  switch (action) {
    case 'refresh_evidencevaultizability_summary':
      return 'Refresh evidencevaultizability summary'
  }
}

export function formatEvidencevaultizabilityDomain(
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

export async function fetchEvidencevaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/evidencevaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return evidencevaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
