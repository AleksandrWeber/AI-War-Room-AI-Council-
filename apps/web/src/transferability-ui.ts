import {
  transferabilityAdminActionResponseSchema,
  transferabilityAdminSummaryResponseSchema,
  transferabilityCapabilitiesResponseSchema,
  transferabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTransferabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/transferability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return transferabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchTransferabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/transferability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return transferabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTransferabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_transferability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/transferability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return transferabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatTransferabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTransferabilityRolloutCheckStatus(
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

export function formatTransferabilityAdminAction(action: 'refresh_transferability_summary') {
  switch (action) {
    case 'refresh_transferability_summary':
      return 'Refresh transferability summary'
  }
}

export function formatTransferabilityDomain(
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

export async function fetchTransferabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/transferability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return transferabilityCapabilitiesResponseSchema.parse(await response.json())
}
