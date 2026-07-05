import {
  clusteringizabilityAdminActionResponseSchema,
  clusteringizabilityAdminSummaryResponseSchema,
  clusteringizabilityCapabilitiesResponseSchema,
  clusteringizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchClusteringizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/clusteringizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return clusteringizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchClusteringizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/clusteringizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return clusteringizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeClusteringizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_clusteringizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/clusteringizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return clusteringizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatClusteringizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatClusteringizabilityRolloutCheckStatus(
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

export function formatClusteringizabilityAdminAction(action: 'refresh_clusteringizability_summary') {
  switch (action) {
    case 'refresh_clusteringizability_summary':
      return 'Refresh clusteringizability summary'
  }
}

export function formatClusteringizabilityDomain(
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

export async function fetchClusteringizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/clusteringizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return clusteringizabilityCapabilitiesResponseSchema.parse(await response.json())
}
