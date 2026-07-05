import {
  provenanceAdminActionResponseSchema,
  provenanceAdminSummaryResponseSchema,
  provenanceCapabilitiesResponseSchema,
  provenanceRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchProvenanceRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/provenance/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return provenanceRolloutResponseSchema.parse(await response.json())
}

export async function fetchProvenanceAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/provenance/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return provenanceAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeProvenanceAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_provenance_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/provenance/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return provenanceAdminActionResponseSchema.parse(await response.json())
}

export function formatProvenanceRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatProvenanceRolloutCheckStatus(
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

export function formatProvenanceAdminAction(action: 'refresh_provenance_summary') {
  switch (action) {
    case 'refresh_provenance_summary':
      return 'Refresh provenance summary'
  }
}

export function formatProvenanceDomain(
  domain: 'completed_runs' | 'failed_runs' | 'usage_events' | 'artifacts',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'usage_events':
      return 'Usage events'
    case 'artifacts':
      return 'Artifacts'
  }
}

export async function fetchProvenanceCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/provenance/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return provenanceCapabilitiesResponseSchema.parse(await response.json())
}
