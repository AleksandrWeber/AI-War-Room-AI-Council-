import {
  attributabilityvaultizabilityAdminActionResponseSchema,
  attributabilityvaultizabilityAdminSummaryResponseSchema,
  attributabilityvaultizabilityCapabilitiesResponseSchema,
  attributabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAttributabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/attributabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return attributabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAttributabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/attributabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return attributabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAttributabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_attributabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/attributabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return attributabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAttributabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAttributabilityvaultizabilityRolloutCheckStatus(
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

export function formatAttributabilityvaultizabilityAdminAction(action: 'refresh_attributabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_attributabilityvaultizability_summary':
      return 'Refresh attributabilityvaultizability summary'
  }
}

export function formatAttributabilityvaultizabilityDomain(
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

export async function fetchAttributabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/attributabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return attributabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
