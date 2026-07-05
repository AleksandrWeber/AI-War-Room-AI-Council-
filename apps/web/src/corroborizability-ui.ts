import {
  corroborizabilityAdminActionResponseSchema,
  corroborizabilityAdminSummaryResponseSchema,
  corroborizabilityCapabilitiesResponseSchema,
  corroborizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCorroborizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/corroborizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return corroborizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCorroborizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/corroborizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return corroborizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCorroborizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_corroborizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/corroborizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return corroborizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCorroborizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCorroborizabilityRolloutCheckStatus(
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

export function formatCorroborizabilityAdminAction(action: 'refresh_corroborizability_summary') {
  switch (action) {
    case 'refresh_corroborizability_summary':
      return 'Refresh corroborizability summary'
  }
}

export function formatCorroborizabilityDomain(
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

export async function fetchCorroborizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/corroborizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return corroborizabilityCapabilitiesResponseSchema.parse(await response.json())
}
