import {
  connectabilityvaultizabilityAdminActionResponseSchema,
  connectabilityvaultizabilityAdminSummaryResponseSchema,
  connectabilityvaultizabilityCapabilitiesResponseSchema,
  connectabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchConnectabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/connectabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return connectabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchConnectabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/connectabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return connectabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeConnectabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_connectabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/connectabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return connectabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatConnectabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatConnectabilityvaultizabilityRolloutCheckStatus(
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

export function formatConnectabilityvaultizabilityAdminAction(action: 'refresh_connectabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_connectabilityvaultizability_summary':
      return 'Refresh connectabilityvaultizability summary'
  }
}

export function formatConnectabilityvaultizabilityDomain(
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

export async function fetchConnectabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/connectabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return connectabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
