import {
  defensibilityvaultizabilityAdminActionResponseSchema,
  defensibilityvaultizabilityAdminSummaryResponseSchema,
  defensibilityvaultizabilityCapabilitiesResponseSchema,
  defensibilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDefensibilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/defensibilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return defensibilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDefensibilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/defensibilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return defensibilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDefensibilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_defensibilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/defensibilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return defensibilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDefensibilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDefensibilityvaultizabilityRolloutCheckStatus(
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

export function formatDefensibilityvaultizabilityAdminAction(action: 'refresh_defensibilityvaultizability_summary') {
  switch (action) {
    case 'refresh_defensibilityvaultizability_summary':
      return 'Refresh defensibilityvaultizability summary'
  }
}

export function formatDefensibilityvaultizabilityDomain(
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

export async function fetchDefensibilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/defensibilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return defensibilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
