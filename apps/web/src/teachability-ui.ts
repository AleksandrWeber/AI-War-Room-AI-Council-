import {
  teachabilityAdminActionResponseSchema,
  teachabilityAdminSummaryResponseSchema,
  teachabilityCapabilitiesResponseSchema,
  teachabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTeachabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/teachability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return teachabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchTeachabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/teachability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return teachabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTeachabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_teachability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/teachability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return teachabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatTeachabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTeachabilityRolloutCheckStatus(
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

export function formatTeachabilityAdminAction(action: 'refresh_teachability_summary') {
  switch (action) {
    case 'refresh_teachability_summary':
      return 'Refresh teachability summary'
  }
}

export function formatTeachabilityDomain(
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

export async function fetchTeachabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/teachability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return teachabilityCapabilitiesResponseSchema.parse(await response.json())
}
