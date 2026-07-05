import {
  compatibilizabilityAdminActionResponseSchema,
  compatibilizabilityAdminSummaryResponseSchema,
  compatibilizabilityCapabilitiesResponseSchema,
  compatibilizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCompatibilizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/compatibilizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return compatibilizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCompatibilizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/compatibilizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return compatibilizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCompatibilizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_compatibilizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/compatibilizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return compatibilizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCompatibilizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCompatibilizabilityRolloutCheckStatus(
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

export function formatCompatibilizabilityAdminAction(action: 'refresh_compatibilizability_summary') {
  switch (action) {
    case 'refresh_compatibilizability_summary':
      return 'Refresh compatibilizability summary'
  }
}

export function formatCompatibilizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_webhook_events' | 'billing_records',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_webhook_events':
      return 'Billing webhook events'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchCompatibilizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/compatibilizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return compatibilizabilityCapabilitiesResponseSchema.parse(await response.json())
}
