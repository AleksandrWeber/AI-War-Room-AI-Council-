import {
  orchestrabilityvaultizabilityAdminActionResponseSchema,
  orchestrabilityvaultizabilityAdminSummaryResponseSchema,
  orchestrabilityvaultizabilityCapabilitiesResponseSchema,
  orchestrabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchOrchestrabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/orchestrabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return orchestrabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchOrchestrabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/orchestrabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return orchestrabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeOrchestrabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_orchestrabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/orchestrabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return orchestrabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatOrchestrabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatOrchestrabilityvaultizabilityRolloutCheckStatus(
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

export function formatOrchestrabilityvaultizabilityAdminAction(action: 'refresh_orchestrabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_orchestrabilityvaultizability_summary':
      return 'Refresh orchestrabilityvaultizability summary'
  }
}

export function formatOrchestrabilityvaultizabilityDomain(
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

export async function fetchOrchestrabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/orchestrabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return orchestrabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
