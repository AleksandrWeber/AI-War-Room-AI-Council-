import {
  elaboratabilityAdminActionResponseSchema,
  elaboratabilityAdminSummaryResponseSchema,
  elaboratabilityCapabilitiesResponseSchema,
  elaboratabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchElaboratabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/elaboratability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return elaboratabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchElaboratabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/elaboratability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return elaboratabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeElaboratabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_elaboratability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/elaboratability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return elaboratabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatElaboratabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatElaboratabilityRolloutCheckStatus(
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

export function formatElaboratabilityAdminAction(action: 'refresh_elaboratability_summary') {
  switch (action) {
    case 'refresh_elaboratability_summary':
      return 'Refresh elaboratability summary'
  }
}

export function formatElaboratabilityDomain(
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

export async function fetchElaboratabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/elaboratability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return elaboratabilityCapabilitiesResponseSchema.parse(await response.json())
}
