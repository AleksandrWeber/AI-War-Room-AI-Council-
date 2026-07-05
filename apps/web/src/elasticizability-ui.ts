import {
  elasticizabilityAdminActionResponseSchema,
  elasticizabilityAdminSummaryResponseSchema,
  elasticizabilityCapabilitiesResponseSchema,
  elasticizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchElasticizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/elasticizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return elasticizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchElasticizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/elasticizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return elasticizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeElasticizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_elasticizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/elasticizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return elasticizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatElasticizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatElasticizabilityRolloutCheckStatus(
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

export function formatElasticizabilityAdminAction(action: 'refresh_elasticizability_summary') {
  switch (action) {
    case 'refresh_elasticizability_summary':
      return 'Refresh elasticizability summary'
  }
}

export function formatElasticizabilityDomain(
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

export async function fetchElasticizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/elasticizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return elasticizabilityCapabilitiesResponseSchema.parse(await response.json())
}
