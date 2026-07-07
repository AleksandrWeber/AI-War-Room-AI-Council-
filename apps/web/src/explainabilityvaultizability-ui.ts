import {
  explainabilityvaultizabilityAdminActionResponseSchema,
  explainabilityvaultizabilityAdminSummaryResponseSchema,
  explainabilityvaultizabilityCapabilitiesResponseSchema,
  explainabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchExplainabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/explainabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return explainabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchExplainabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/explainabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return explainabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeExplainabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_explainabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/explainabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return explainabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatExplainabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatExplainabilityvaultizabilityRolloutCheckStatus(
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

export function formatExplainabilityvaultizabilityAdminAction(action: 'refresh_explainabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_explainabilityvaultizability_summary':
      return 'Refresh explainabilityvaultizability summary'
  }
}

export function formatExplainabilityvaultizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_memberships' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_memberships':
      return 'Workspace memberships'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchExplainabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/explainabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return explainabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
