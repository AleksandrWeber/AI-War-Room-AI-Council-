import {
  appendizabilityAdminActionResponseSchema,
  appendizabilityAdminSummaryResponseSchema,
  appendizabilityCapabilitiesResponseSchema,
  appendizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAppendizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/appendizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return appendizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAppendizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/appendizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return appendizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAppendizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_appendizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/appendizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return appendizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAppendizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAppendizabilityRolloutCheckStatus(
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

export function formatAppendizabilityAdminAction(action: 'refresh_appendizability_summary') {
  switch (action) {
    case 'refresh_appendizability_summary':
      return 'Refresh appendizability summary'
  }
}

export function formatAppendizabilityDomain(
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

export async function fetchAppendizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/appendizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return appendizabilityCapabilitiesResponseSchema.parse(await response.json())
}
