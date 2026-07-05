import {
  suitabilityAdminActionResponseSchema,
  suitabilityAdminSummaryResponseSchema,
  suitabilityCapabilitiesResponseSchema,
  suitabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSuitabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/suitability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return suitabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSuitabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/suitability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return suitabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSuitabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_suitability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/suitability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return suitabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSuitabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSuitabilityRolloutCheckStatus(
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

export function formatSuitabilityAdminAction(action: 'refresh_suitability_summary') {
  switch (action) {
    case 'refresh_suitability_summary':
      return 'Refresh suitability summary'
  }
}

export function formatSuitabilityDomain(
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

export async function fetchSuitabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/suitability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return suitabilityCapabilitiesResponseSchema.parse(await response.json())
}
