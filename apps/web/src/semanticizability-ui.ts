import {
  semanticizabilityAdminActionResponseSchema,
  semanticizabilityAdminSummaryResponseSchema,
  semanticizabilityCapabilitiesResponseSchema,
  semanticizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSemanticizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/semanticizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return semanticizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSemanticizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/semanticizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return semanticizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSemanticizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_semanticizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/semanticizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return semanticizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSemanticizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSemanticizabilityRolloutCheckStatus(
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

export function formatSemanticizabilityAdminAction(action: 'refresh_semanticizability_summary') {
  switch (action) {
    case 'refresh_semanticizability_summary':
      return 'Refresh semanticizability summary'
  }
}

export function formatSemanticizabilityDomain(
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

export async function fetchSemanticizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/semanticizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return semanticizabilityCapabilitiesResponseSchema.parse(await response.json())
}
