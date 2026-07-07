import {
  forensicizabilityAdminActionResponseSchema,
  forensicizabilityAdminSummaryResponseSchema,
  forensicizabilityCapabilitiesResponseSchema,
  forensicizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchForensicizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/forensicizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return forensicizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchForensicizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/forensicizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return forensicizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeForensicizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_forensicizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/forensicizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return forensicizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatForensicizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatForensicizabilityRolloutCheckStatus(
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

export function formatForensicizabilityAdminAction(action: 'refresh_forensicizability_summary') {
  switch (action) {
    case 'refresh_forensicizability_summary':
      return 'Refresh forensicizability summary'
  }
}

export function formatForensicizabilityDomain(
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

export async function fetchForensicizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/forensicizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return forensicizabilityCapabilitiesResponseSchema.parse(await response.json())
}
