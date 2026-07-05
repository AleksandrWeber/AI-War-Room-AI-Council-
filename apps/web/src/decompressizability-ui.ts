import {
  decompressizabilityAdminActionResponseSchema,
  decompressizabilityAdminSummaryResponseSchema,
  decompressizabilityCapabilitiesResponseSchema,
  decompressizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDecompressizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/decompressizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return decompressizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDecompressizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/decompressizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return decompressizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDecompressizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_decompressizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/decompressizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return decompressizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDecompressizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDecompressizabilityRolloutCheckStatus(
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

export function formatDecompressizabilityAdminAction(action: 'refresh_decompressizability_summary') {
  switch (action) {
    case 'refresh_decompressizability_summary':
      return 'Refresh decompressizability summary'
  }
}

export function formatDecompressizabilityDomain(
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

export async function fetchDecompressizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/decompressizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return decompressizabilityCapabilitiesResponseSchema.parse(await response.json())
}
