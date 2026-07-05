import {
  expandizabilityAdminActionResponseSchema,
  expandizabilityAdminSummaryResponseSchema,
  expandizabilityCapabilitiesResponseSchema,
  expandizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchExpandizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/expandizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return expandizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchExpandizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/expandizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return expandizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeExpandizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_expandizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/expandizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return expandizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatExpandizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatExpandizabilityRolloutCheckStatus(
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

export function formatExpandizabilityAdminAction(action: 'refresh_expandizability_summary') {
  switch (action) {
    case 'refresh_expandizability_summary':
      return 'Refresh expandizability summary'
  }
}

export function formatExpandizabilityDomain(
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

export async function fetchExpandizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/expandizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return expandizabilityCapabilitiesResponseSchema.parse(await response.json())
}
