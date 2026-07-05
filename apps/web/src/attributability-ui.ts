import {
  attributabilityAdminActionResponseSchema,
  attributabilityAdminSummaryResponseSchema,
  attributabilityCapabilitiesResponseSchema,
  attributabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAttributabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/attributability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return attributabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAttributabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/attributability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return attributabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAttributabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_attributability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/attributability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return attributabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAttributabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAttributabilityRolloutCheckStatus(
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

export function formatAttributabilityAdminAction(action: 'refresh_attributability_summary') {
  switch (action) {
    case 'refresh_attributability_summary':
      return 'Refresh attributability summary'
  }
}

export function formatAttributabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'agent_outputs' | 'artifacts',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'agent_outputs':
      return 'Agent outputs'
    case 'artifacts':
      return 'Artifacts'
  }
}

export async function fetchAttributabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/attributability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return attributabilityCapabilitiesResponseSchema.parse(await response.json())
}
