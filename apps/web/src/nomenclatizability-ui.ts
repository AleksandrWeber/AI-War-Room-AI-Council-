import {
  nomenclatizabilityAdminActionResponseSchema,
  nomenclatizabilityAdminSummaryResponseSchema,
  nomenclatizabilityCapabilitiesResponseSchema,
  nomenclatizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchNomenclatizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/nomenclatizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return nomenclatizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchNomenclatizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/nomenclatizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return nomenclatizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeNomenclatizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_nomenclatizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/nomenclatizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return nomenclatizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatNomenclatizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatNomenclatizabilityRolloutCheckStatus(
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

export function formatNomenclatizabilityAdminAction(action: 'refresh_nomenclatizability_summary') {
  switch (action) {
    case 'refresh_nomenclatizability_summary':
      return 'Refresh nomenclatizability summary'
  }
}

export function formatNomenclatizabilityDomain(
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

export async function fetchNomenclatizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/nomenclatizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return nomenclatizabilityCapabilitiesResponseSchema.parse(await response.json())
}
