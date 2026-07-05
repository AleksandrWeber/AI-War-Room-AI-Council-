import {
  inferencizabilityAdminActionResponseSchema,
  inferencizabilityAdminSummaryResponseSchema,
  inferencizabilityCapabilitiesResponseSchema,
  inferencizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchInferencizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/inferencizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return inferencizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchInferencizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/inferencizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return inferencizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeInferencizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_inferencizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/inferencizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return inferencizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatInferencizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatInferencizabilityRolloutCheckStatus(
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

export function formatInferencizabilityAdminAction(action: 'refresh_inferencizability_summary') {
  switch (action) {
    case 'refresh_inferencizability_summary':
      return 'Refresh inferencizability summary'
  }
}

export function formatInferencizabilityDomain(
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

export async function fetchInferencizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/inferencizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return inferencizabilityCapabilitiesResponseSchema.parse(await response.json())
}
