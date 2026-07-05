import {
  splitizabilityAdminActionResponseSchema,
  splitizabilityAdminSummaryResponseSchema,
  splitizabilityCapabilitiesResponseSchema,
  splitizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSplitizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/splitizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return splitizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSplitizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/splitizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return splitizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSplitizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_splitizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/splitizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return splitizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSplitizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSplitizabilityRolloutCheckStatus(
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

export function formatSplitizabilityAdminAction(action: 'refresh_splitizability_summary') {
  switch (action) {
    case 'refresh_splitizability_summary':
      return 'Refresh splitizability summary'
  }
}

export function formatSplitizabilityDomain(
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

export async function fetchSplitizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/splitizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return splitizabilityCapabilitiesResponseSchema.parse(await response.json())
}
