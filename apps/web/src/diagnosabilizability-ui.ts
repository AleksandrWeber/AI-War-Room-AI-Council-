import {
  diagnosabilizabilityAdminActionResponseSchema,
  diagnosabilizabilityAdminSummaryResponseSchema,
  diagnosabilizabilityCapabilitiesResponseSchema,
  diagnosabilizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDiagnosabilizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/diagnosabilizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return diagnosabilizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDiagnosabilizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/diagnosabilizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return diagnosabilizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDiagnosabilizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_diagnosabilizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/diagnosabilizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return diagnosabilizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDiagnosabilizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDiagnosabilizabilityRolloutCheckStatus(
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

export function formatDiagnosabilizabilityAdminAction(action: 'refresh_diagnosabilizability_summary') {
  switch (action) {
    case 'refresh_diagnosabilizability_summary':
      return 'Refresh diagnosabilizability summary'
  }
}

export function formatDiagnosabilizabilityDomain(
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

export async function fetchDiagnosabilizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/diagnosabilizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return diagnosabilizabilityCapabilitiesResponseSchema.parse(await response.json())
}
