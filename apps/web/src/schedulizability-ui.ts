import {
  schedulizabilityAdminActionResponseSchema,
  schedulizabilityAdminSummaryResponseSchema,
  schedulizabilityCapabilitiesResponseSchema,
  schedulizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSchedulizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/schedulizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return schedulizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSchedulizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/schedulizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return schedulizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSchedulizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_schedulizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/schedulizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return schedulizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSchedulizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSchedulizabilityRolloutCheckStatus(
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

export function formatSchedulizabilityAdminAction(action: 'refresh_schedulizability_summary') {
  switch (action) {
    case 'refresh_schedulizability_summary':
      return 'Refresh schedulizability summary'
  }
}

export function formatSchedulizabilityDomain(
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

export async function fetchSchedulizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/schedulizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return schedulizabilityCapabilitiesResponseSchema.parse(await response.json())
}
