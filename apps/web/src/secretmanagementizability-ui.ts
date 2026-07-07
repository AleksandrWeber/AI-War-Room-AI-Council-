import {
  secretmanagementizabilityAdminActionResponseSchema,
  secretmanagementizabilityAdminSummaryResponseSchema,
  secretmanagementizabilityCapabilitiesResponseSchema,
  secretmanagementizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSecretmanagementizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/secretmanagementizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return secretmanagementizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSecretmanagementizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/secretmanagementizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return secretmanagementizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSecretmanagementizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_secretmanagementizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/secretmanagementizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return secretmanagementizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSecretmanagementizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSecretmanagementizabilityRolloutCheckStatus(
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

export function formatSecretmanagementizabilityAdminAction(action: 'refresh_secretmanagementizability_summary') {
  switch (action) {
    case 'refresh_secretmanagementizability_summary':
      return 'Refresh secretmanagementizability summary'
  }
}

export function formatSecretmanagementizabilityDomain(
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

export async function fetchSecretmanagementizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/secretmanagementizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return secretmanagementizabilityCapabilitiesResponseSchema.parse(await response.json())
}
