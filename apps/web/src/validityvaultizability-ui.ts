import {
  validityvaultizabilityAdminActionResponseSchema,
  validityvaultizabilityAdminSummaryResponseSchema,
  validityvaultizabilityCapabilitiesResponseSchema,
  validityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchValidityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/validityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return validityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchValidityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/validityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return validityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeValidityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_validityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/validityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return validityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatValidityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatValidityvaultizabilityRolloutCheckStatus(
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

export function formatValidityvaultizabilityAdminAction(action: 'refresh_validityvaultizability_summary') {
  switch (action) {
    case 'refresh_validityvaultizability_summary':
      return 'Refresh validityvaultizability summary'
  }
}

export function formatValidityvaultizabilityDomain(
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

export async function fetchValidityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/validityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return validityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
