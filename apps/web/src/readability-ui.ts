import {
  readabilityAdminActionResponseSchema,
  readabilityAdminSummaryResponseSchema,
  readabilityCapabilitiesResponseSchema,
  readabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchReadabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/readability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return readabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchReadabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/readability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return readabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeReadabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_readability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/readability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return readabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatReadabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatReadabilityRolloutCheckStatus(
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

export function formatReadabilityAdminAction(action: 'refresh_readability_summary') {
  switch (action) {
    case 'refresh_readability_summary':
      return 'Refresh readability summary'
  }
}

export function formatReadabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'artifacts' | 'agent_outputs',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'artifacts':
      return 'Artifacts'
    case 'agent_outputs':
      return 'Agent outputs'
  }
}

export async function fetchReadabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/readability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return readabilityCapabilitiesResponseSchema.parse(await response.json())
}
