import {
  validityAdminActionResponseSchema,
  validityAdminSummaryResponseSchema,
  validityCapabilitiesResponseSchema,
  validityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchValidityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/validity/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return validityRolloutResponseSchema.parse(await response.json())
}

export async function fetchValidityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/validity/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return validityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeValidityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_validity_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/validity/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return validityAdminActionResponseSchema.parse(await response.json())
}

export function formatValidityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatValidityRolloutCheckStatus(
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

export function formatValidityAdminAction(action: 'refresh_validity_summary') {
  switch (action) {
    case 'refresh_validity_summary':
      return 'Refresh validity summary'
  }
}

export function formatValidityDomain(
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

export async function fetchValidityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/validity/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return validityCapabilitiesResponseSchema.parse(await response.json())
}
