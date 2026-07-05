import {
  representabilityAdminActionResponseSchema,
  representabilityAdminSummaryResponseSchema,
  representabilityCapabilitiesResponseSchema,
  representabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRepresentabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/representability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return representabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRepresentabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/representability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return representabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRepresentabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_representability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/representability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return representabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRepresentabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRepresentabilityRolloutCheckStatus(
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

export function formatRepresentabilityAdminAction(action: 'refresh_representability_summary') {
  switch (action) {
    case 'refresh_representability_summary':
      return 'Refresh representability summary'
  }
}

export function formatRepresentabilityDomain(
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

export async function fetchRepresentabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/representability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return representabilityCapabilitiesResponseSchema.parse(await response.json())
}
