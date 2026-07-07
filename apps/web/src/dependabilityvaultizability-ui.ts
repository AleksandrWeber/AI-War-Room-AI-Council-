import {
  dependabilityvaultizabilityAdminActionResponseSchema,
  dependabilityvaultizabilityAdminSummaryResponseSchema,
  dependabilityvaultizabilityCapabilitiesResponseSchema,
  dependabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDependabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/dependabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return dependabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDependabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/dependabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return dependabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDependabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_dependabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/dependabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return dependabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDependabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDependabilityvaultizabilityRolloutCheckStatus(
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

export function formatDependabilityvaultizabilityAdminAction(action: 'refresh_dependabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_dependabilityvaultizability_summary':
      return 'Refresh dependabilityvaultizability summary'
  }
}

export function formatDependabilityvaultizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'idempotency_keys' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'idempotency_keys':
      return 'Idempotency keys'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchDependabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/dependabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return dependabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
