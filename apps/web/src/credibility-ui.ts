import {
  credibilityAdminActionResponseSchema,
  credibilityAdminSummaryResponseSchema,
  credibilityCapabilitiesResponseSchema,
  credibilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCredibilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/credibility/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return credibilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCredibilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/credibility/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return credibilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCredibilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_credibility_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/credibility/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return credibilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCredibilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCredibilityRolloutCheckStatus(
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

export function formatCredibilityAdminAction(action: 'refresh_credibility_summary') {
  switch (action) {
    case 'refresh_credibility_summary':
      return 'Refresh credibility summary'
  }
}

export function formatCredibilityDomain(
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

export async function fetchCredibilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/credibility/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return credibilityCapabilitiesResponseSchema.parse(await response.json())
}
