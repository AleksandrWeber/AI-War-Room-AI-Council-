import {
  dependabilityAdminActionResponseSchema,
  dependabilityAdminSummaryResponseSchema,
  dependabilityCapabilitiesResponseSchema,
  dependabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDependabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/dependability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return dependabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDependabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/dependability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return dependabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDependabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_dependability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/dependability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return dependabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDependabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDependabilityRolloutCheckStatus(
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

export function formatDependabilityAdminAction(action: 'refresh_dependability_summary') {
  switch (action) {
    case 'refresh_dependability_summary':
      return 'Refresh dependability summary'
  }
}

export function formatDependabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_records' | 'billing_invoices',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_records':
      return 'Billing records'
    case 'billing_invoices':
      return 'Billing invoices'
  }
}

export async function fetchDependabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/dependability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return dependabilityCapabilitiesResponseSchema.parse(await response.json())
}
