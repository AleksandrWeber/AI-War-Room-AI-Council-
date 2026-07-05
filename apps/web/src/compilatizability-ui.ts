import {
  compilatizabilityAdminActionResponseSchema,
  compilatizabilityAdminSummaryResponseSchema,
  compilatizabilityCapabilitiesResponseSchema,
  compilatizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCompilatizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/compilatizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return compilatizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCompilatizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/compilatizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return compilatizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCompilatizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_compilatizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/compilatizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return compilatizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCompilatizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCompilatizabilityRolloutCheckStatus(
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

export function formatCompilatizabilityAdminAction(action: 'refresh_compilatizability_summary') {
  switch (action) {
    case 'refresh_compilatizability_summary':
      return 'Refresh compilatizability summary'
  }
}

export function formatCompilatizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'model_health_events' | 'billing_records',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'model_health_events':
      return 'Model health events'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchCompilatizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/compilatizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return compilatizabilityCapabilitiesResponseSchema.parse(await response.json())
}
