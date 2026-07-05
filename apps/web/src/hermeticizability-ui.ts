import {
  hermeticizabilityAdminActionResponseSchema,
  hermeticizabilityAdminSummaryResponseSchema,
  hermeticizabilityCapabilitiesResponseSchema,
  hermeticizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchHermeticizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/hermeticizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return hermeticizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchHermeticizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/hermeticizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return hermeticizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeHermeticizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_hermeticizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/hermeticizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return hermeticizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatHermeticizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatHermeticizabilityRolloutCheckStatus(
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

export function formatHermeticizabilityAdminAction(action: 'refresh_hermeticizability_summary') {
  switch (action) {
    case 'refresh_hermeticizability_summary':
      return 'Refresh hermeticizability summary'
  }
}

export function formatHermeticizabilityDomain(
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

export async function fetchHermeticizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/hermeticizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return hermeticizabilityCapabilitiesResponseSchema.parse(await response.json())
}
