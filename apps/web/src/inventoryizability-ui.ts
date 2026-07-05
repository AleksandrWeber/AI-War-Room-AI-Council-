import {
  inventoryizabilityAdminActionResponseSchema,
  inventoryizabilityAdminSummaryResponseSchema,
  inventoryizabilityCapabilitiesResponseSchema,
  inventoryizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchInventoryizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/inventoryizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return inventoryizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchInventoryizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/inventoryizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return inventoryizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeInventoryizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_inventoryizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/inventoryizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return inventoryizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatInventoryizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatInventoryizabilityRolloutCheckStatus(
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

export function formatInventoryizabilityAdminAction(action: 'refresh_inventoryizability_summary') {
  switch (action) {
    case 'refresh_inventoryizability_summary':
      return 'Refresh inventoryizability summary'
  }
}

export function formatInventoryizabilityDomain(
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

export async function fetchInventoryizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/inventoryizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return inventoryizabilityCapabilitiesResponseSchema.parse(await response.json())
}
