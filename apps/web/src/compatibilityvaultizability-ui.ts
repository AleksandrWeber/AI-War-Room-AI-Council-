import {
  compatibilityvaultizabilityAdminActionResponseSchema,
  compatibilityvaultizabilityAdminSummaryResponseSchema,
  compatibilityvaultizabilityCapabilitiesResponseSchema,
  compatibilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCompatibilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/compatibilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return compatibilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCompatibilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/compatibilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return compatibilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCompatibilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_compatibilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/compatibilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return compatibilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCompatibilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCompatibilityvaultizabilityRolloutCheckStatus(
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

export function formatCompatibilityvaultizabilityAdminAction(action: 'refresh_compatibilityvaultizability_summary') {
  switch (action) {
    case 'refresh_compatibilityvaultizability_summary':
      return 'Refresh compatibilityvaultizability summary'
  }
}

export function formatCompatibilityvaultizabilityDomain(
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

export async function fetchCompatibilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/compatibilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return compatibilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
