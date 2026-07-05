import {
  explainabilityAdminActionResponseSchema,
  explainabilityAdminSummaryResponseSchema,
  explainabilityCapabilitiesResponseSchema,
  explainabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchExplainabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/explainability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return explainabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchExplainabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/explainability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return explainabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeExplainabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_explainability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/explainability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return explainabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatExplainabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatExplainabilityRolloutCheckStatus(
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

export function formatExplainabilityAdminAction(action: 'refresh_explainability_summary') {
  switch (action) {
    case 'refresh_explainability_summary':
      return 'Refresh explainability summary'
  }
}

export function formatExplainabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'moderator_syntheses' | 'artifacts',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'moderator_syntheses':
      return 'Moderator syntheses'
    case 'artifacts':
      return 'Artifacts'
  }
}

export async function fetchExplainabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/explainability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return explainabilityCapabilitiesResponseSchema.parse(await response.json())
}
