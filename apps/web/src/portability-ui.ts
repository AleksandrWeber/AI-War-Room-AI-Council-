import {
  portabilityAdminActionResponseSchema,
  portabilityAdminSummaryResponseSchema,
  portabilityCapabilitiesResponseSchema,
  portabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchPortabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/portability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return portabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchPortabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/portability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return portabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executePortabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_portability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/portability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return portabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatPortabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatPortabilityRolloutCheckStatus(
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

export function formatPortabilityAdminAction(action: 'refresh_portability_summary') {
  switch (action) {
    case 'refresh_portability_summary':
      return 'Refresh portability summary'
  }
}

export function formatPortabilityDomain(
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

export async function fetchPortabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/portability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return portabilityCapabilitiesResponseSchema.parse(await response.json())
}
