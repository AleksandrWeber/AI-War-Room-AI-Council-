import {
  coherenceAdminActionResponseSchema,
  coherenceAdminSummaryResponseSchema,
  coherenceCapabilitiesResponseSchema,
  coherenceRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCoherenceRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/coherence/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return coherenceRolloutResponseSchema.parse(await response.json())
}

export async function fetchCoherenceAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/coherence/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return coherenceAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCoherenceAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_coherence_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/coherence/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return coherenceAdminActionResponseSchema.parse(await response.json())
}

export function formatCoherenceRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCoherenceRolloutCheckStatus(
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

export function formatCoherenceAdminAction(action: 'refresh_coherence_summary') {
  switch (action) {
    case 'refresh_coherence_summary':
      return 'Refresh coherence summary'
  }
}

export function formatCoherenceDomain(
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

export async function fetchCoherenceCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/coherence/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return coherenceCapabilitiesResponseSchema.parse(await response.json())
}
