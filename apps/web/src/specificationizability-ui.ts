import {
  specificationizabilityAdminActionResponseSchema,
  specificationizabilityAdminSummaryResponseSchema,
  specificationizabilityCapabilitiesResponseSchema,
  specificationizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSpecificationizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/specificationizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return specificationizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSpecificationizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/specificationizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return specificationizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSpecificationizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_specificationizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/specificationizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return specificationizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSpecificationizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSpecificationizabilityRolloutCheckStatus(
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

export function formatSpecificationizabilityAdminAction(action: 'refresh_specificationizability_summary') {
  switch (action) {
    case 'refresh_specificationizability_summary':
      return 'Refresh specificationizability summary'
  }
}

export function formatSpecificationizabilityDomain(
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

export async function fetchSpecificationizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/specificationizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return specificationizabilityCapabilitiesResponseSchema.parse(await response.json())
}
