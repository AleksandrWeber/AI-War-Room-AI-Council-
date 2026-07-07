import {
  operabilityvaultizabilityAdminActionResponseSchema,
  operabilityvaultizabilityAdminSummaryResponseSchema,
  operabilityvaultizabilityCapabilitiesResponseSchema,
  operabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchOperabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/operabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return operabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchOperabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/operabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return operabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeOperabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_operabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/operabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return operabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatOperabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatOperabilityvaultizabilityRolloutCheckStatus(
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

export function formatOperabilityvaultizabilityAdminAction(action: 'refresh_operabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_operabilityvaultizability_summary':
      return 'Refresh operabilityvaultizability summary'
  }
}

export function formatOperabilityvaultizabilityDomain(
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

export async function fetchOperabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/operabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return operabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
