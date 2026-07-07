import {
  referencabilityvaultizabilityAdminActionResponseSchema,
  referencabilityvaultizabilityAdminSummaryResponseSchema,
  referencabilityvaultizabilityCapabilitiesResponseSchema,
  referencabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchReferencabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/referencabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return referencabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchReferencabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/referencabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return referencabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeReferencabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_referencabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/referencabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return referencabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatReferencabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatReferencabilityvaultizabilityRolloutCheckStatus(
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

export function formatReferencabilityvaultizabilityAdminAction(action: 'refresh_referencabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_referencabilityvaultizability_summary':
      return 'Refresh referencabilityvaultizability summary'
  }
}

export function formatReferencabilityvaultizabilityDomain(
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

export async function fetchReferencabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/referencabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return referencabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
