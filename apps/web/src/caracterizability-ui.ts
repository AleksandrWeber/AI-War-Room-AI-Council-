import {
  caracterizabilityAdminActionResponseSchema,
  caracterizabilityAdminSummaryResponseSchema,
  caracterizabilityCapabilitiesResponseSchema,
  caracterizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCaracterizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/caracterizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return caracterizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCaracterizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/caracterizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return caracterizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCaracterizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_caracterizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/caracterizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return caracterizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCaracterizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCaracterizabilityRolloutCheckStatus(
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

export function formatCaracterizabilityAdminAction(action: 'refresh_caracterizability_summary') {
  switch (action) {
    case 'refresh_caracterizability_summary':
      return 'Refresh caracterizability summary'
  }
}

export function formatCaracterizabilityDomain(
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

export async function fetchCaracterizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/caracterizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return caracterizabilityCapabilitiesResponseSchema.parse(await response.json())
}
