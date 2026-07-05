import {
  describabilityAdminActionResponseSchema,
  describabilityAdminSummaryResponseSchema,
  describabilityCapabilitiesResponseSchema,
  describabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDescribabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/describability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return describabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDescribabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/describability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return describabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDescribabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_describability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/describability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return describabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDescribabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDescribabilityRolloutCheckStatus(
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

export function formatDescribabilityAdminAction(action: 'refresh_describability_summary') {
  switch (action) {
    case 'refresh_describability_summary':
      return 'Refresh describability summary'
  }
}

export function formatDescribabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'run_workflows' | 'agent_outputs',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'run_workflows':
      return 'Run workflows'
    case 'agent_outputs':
      return 'Agent outputs'
  }
}

export async function fetchDescribabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/describability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return describabilityCapabilitiesResponseSchema.parse(await response.json())
}
