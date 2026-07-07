import {
  confidentialityizabilityAdminActionResponseSchema,
  confidentialityizabilityAdminSummaryResponseSchema,
  confidentialityizabilityCapabilitiesResponseSchema,
  confidentialityizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchConfidentialityizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/confidentialityizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return confidentialityizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchConfidentialityizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/confidentialityizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return confidentialityizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeConfidentialityizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_confidentialityizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/confidentialityizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return confidentialityizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatConfidentialityizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatConfidentialityizabilityRolloutCheckStatus(
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

export function formatConfidentialityizabilityAdminAction(action: 'refresh_confidentialityizability_summary') {
  switch (action) {
    case 'refresh_confidentialityizability_summary':
      return 'Refresh confidentialityizability summary'
  }
}

export function formatConfidentialityizabilityDomain(
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

export async function fetchConfidentialityizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/confidentialityizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return confidentialityizabilityCapabilitiesResponseSchema.parse(await response.json())
}
