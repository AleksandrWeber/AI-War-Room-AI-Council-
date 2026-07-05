import {
  extensibilizabilityAdminActionResponseSchema,
  extensibilizabilityAdminSummaryResponseSchema,
  extensibilizabilityCapabilitiesResponseSchema,
  extensibilizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchExtensibilizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/extensibilizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return extensibilizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchExtensibilizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/extensibilizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return extensibilizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeExtensibilizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_extensibilizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/extensibilizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return extensibilizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatExtensibilizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatExtensibilizabilityRolloutCheckStatus(
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

export function formatExtensibilizabilityAdminAction(action: 'refresh_extensibilizability_summary') {
  switch (action) {
    case 'refresh_extensibilizability_summary':
      return 'Refresh extensibilizability summary'
  }
}

export function formatExtensibilizabilityDomain(
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

export async function fetchExtensibilizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/extensibilizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return extensibilizabilityCapabilitiesResponseSchema.parse(await response.json())
}
