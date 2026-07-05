import {
  appropriatenessAdminActionResponseSchema,
  appropriatenessAdminSummaryResponseSchema,
  appropriatenessCapabilitiesResponseSchema,
  appropriatenessRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAppropriatenessRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/appropriateness/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return appropriatenessRolloutResponseSchema.parse(await response.json())
}

export async function fetchAppropriatenessAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/appropriateness/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return appropriatenessAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAppropriatenessAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_appropriateness_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/appropriateness/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return appropriatenessAdminActionResponseSchema.parse(await response.json())
}

export function formatAppropriatenessRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAppropriatenessRolloutCheckStatus(
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

export function formatAppropriatenessAdminAction(action: 'refresh_appropriateness_summary') {
  switch (action) {
    case 'refresh_appropriateness_summary':
      return 'Refresh appropriateness summary'
  }
}

export function formatAppropriatenessDomain(
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

export async function fetchAppropriatenessCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/appropriateness/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return appropriatenessCapabilitiesResponseSchema.parse(await response.json())
}
