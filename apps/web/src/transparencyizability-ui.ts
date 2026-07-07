import {
  transparencyizabilityAdminActionResponseSchema,
  transparencyizabilityAdminSummaryResponseSchema,
  transparencyizabilityCapabilitiesResponseSchema,
  transparencyizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTransparencyizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/transparencyizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return transparencyizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchTransparencyizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/transparencyizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return transparencyizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTransparencyizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_transparencyizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/transparencyizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return transparencyizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatTransparencyizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTransparencyizabilityRolloutCheckStatus(
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

export function formatTransparencyizabilityAdminAction(action: 'refresh_transparencyizability_summary') {
  switch (action) {
    case 'refresh_transparencyizability_summary':
      return 'Refresh transparencyizability summary'
  }
}

export function formatTransparencyizabilityDomain(
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

export async function fetchTransparencyizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/transparencyizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return transparencyizabilityCapabilitiesResponseSchema.parse(await response.json())
}
