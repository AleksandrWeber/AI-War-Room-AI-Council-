import {
  canonicalizabilityAdminActionResponseSchema,
  canonicalizabilityAdminSummaryResponseSchema,
  canonicalizabilityCapabilitiesResponseSchema,
  canonicalizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCanonicalizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/canonicalizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return canonicalizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCanonicalizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/canonicalizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return canonicalizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCanonicalizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_canonicalizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/canonicalizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return canonicalizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCanonicalizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCanonicalizabilityRolloutCheckStatus(
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

export function formatCanonicalizabilityAdminAction(action: 'refresh_canonicalizability_summary') {
  switch (action) {
    case 'refresh_canonicalizability_summary':
      return 'Refresh canonicalizability summary'
  }
}

export function formatCanonicalizabilityDomain(
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

export async function fetchCanonicalizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/canonicalizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return canonicalizabilityCapabilitiesResponseSchema.parse(await response.json())
}
