import {
  provenanceizabilityAdminActionResponseSchema,
  provenanceizabilityAdminSummaryResponseSchema,
  provenanceizabilityCapabilitiesResponseSchema,
  provenanceizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchProvenanceizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/provenanceizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return provenanceizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchProvenanceizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/provenanceizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return provenanceizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeProvenanceizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_provenanceizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/provenanceizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return provenanceizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatProvenanceizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatProvenanceizabilityRolloutCheckStatus(
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

export function formatProvenanceizabilityAdminAction(action: 'refresh_provenanceizability_summary') {
  switch (action) {
    case 'refresh_provenanceizability_summary':
      return 'Refresh provenanceizability summary'
  }
}

export function formatProvenanceizabilityDomain(
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

export async function fetchProvenanceizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/provenanceizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return provenanceizabilityCapabilitiesResponseSchema.parse(await response.json())
}
