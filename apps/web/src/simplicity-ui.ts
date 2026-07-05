import {
  simplicityAdminActionResponseSchema,
  simplicityAdminSummaryResponseSchema,
  simplicityCapabilitiesResponseSchema,
  simplicityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSimplicityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/simplicity/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return simplicityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSimplicityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/simplicity/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return simplicityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSimplicityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_simplicity_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/simplicity/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return simplicityAdminActionResponseSchema.parse(await response.json())
}

export function formatSimplicityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSimplicityRolloutCheckStatus(
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

export function formatSimplicityAdminAction(action: 'refresh_simplicity_summary') {
  switch (action) {
    case 'refresh_simplicity_summary':
      return 'Refresh simplicity summary'
  }
}

export function formatSimplicityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'run_workflows' | 'idempotency_keys',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'run_workflows':
      return 'Run workflows'
    case 'idempotency_keys':
      return 'Idempotency keys'
  }
}

export async function fetchSimplicityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/simplicity/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return simplicityCapabilitiesResponseSchema.parse(await response.json())
}
