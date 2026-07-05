import {
  circuitizabilityAdminActionResponseSchema,
  circuitizabilityAdminSummaryResponseSchema,
  circuitizabilityCapabilitiesResponseSchema,
  circuitizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCircuitizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/circuitizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return circuitizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCircuitizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/circuitizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return circuitizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCircuitizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_circuitizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/circuitizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return circuitizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCircuitizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCircuitizabilityRolloutCheckStatus(
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

export function formatCircuitizabilityAdminAction(action: 'refresh_circuitizability_summary') {
  switch (action) {
    case 'refresh_circuitizability_summary':
      return 'Refresh circuitizability summary'
  }
}

export function formatCircuitizabilityDomain(
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

export async function fetchCircuitizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/circuitizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return circuitizabilityCapabilitiesResponseSchema.parse(await response.json())
}
