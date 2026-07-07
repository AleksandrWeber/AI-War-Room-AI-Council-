import {
  threatizabilityAdminActionResponseSchema,
  threatizabilityAdminSummaryResponseSchema,
  threatizabilityCapabilitiesResponseSchema,
  threatizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchThreatizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/threatizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return threatizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchThreatizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/threatizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return threatizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeThreatizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_threatizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/threatizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return threatizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatThreatizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatThreatizabilityRolloutCheckStatus(
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

export function formatThreatizabilityAdminAction(action: 'refresh_threatizability_summary') {
  switch (action) {
    case 'refresh_threatizability_summary':
      return 'Refresh threatizability summary'
  }
}

export function formatThreatizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_invoices' | 'billing_records',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_invoices':
      return 'Billing invoices'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchThreatizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/threatizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return threatizabilityCapabilitiesResponseSchema.parse(await response.json())
}
