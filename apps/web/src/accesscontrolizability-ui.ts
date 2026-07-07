import {
  accesscontrolizabilityAdminActionResponseSchema,
  accesscontrolizabilityAdminSummaryResponseSchema,
  accesscontrolizabilityCapabilitiesResponseSchema,
  accesscontrolizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAccesscontrolizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/accesscontrolizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return accesscontrolizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAccesscontrolizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/accesscontrolizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return accesscontrolizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAccesscontrolizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_accesscontrolizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/accesscontrolizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return accesscontrolizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAccesscontrolizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAccesscontrolizabilityRolloutCheckStatus(
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

export function formatAccesscontrolizabilityAdminAction(action: 'refresh_accesscontrolizability_summary') {
  switch (action) {
    case 'refresh_accesscontrolizability_summary':
      return 'Refresh accesscontrolizability summary'
  }
}

export function formatAccesscontrolizabilityDomain(
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

export async function fetchAccesscontrolizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/accesscontrolizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return accesscontrolizabilityCapabilitiesResponseSchema.parse(await response.json())
}
