import {
  dialectizabilityAdminActionResponseSchema,
  dialectizabilityAdminSummaryResponseSchema,
  dialectizabilityCapabilitiesResponseSchema,
  dialectizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDialectizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/dialectizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return dialectizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDialectizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/dialectizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return dialectizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDialectizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_dialectizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/dialectizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return dialectizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDialectizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDialectizabilityRolloutCheckStatus(
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

export function formatDialectizabilityAdminAction(action: 'refresh_dialectizability_summary') {
  switch (action) {
    case 'refresh_dialectizability_summary':
      return 'Refresh dialectizability summary'
  }
}

export function formatDialectizabilityDomain(
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

export async function fetchDialectizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/dialectizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return dialectizabilityCapabilitiesResponseSchema.parse(await response.json())
}
