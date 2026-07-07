import {
  registryvaultizabilityAdminActionResponseSchema,
  registryvaultizabilityAdminSummaryResponseSchema,
  registryvaultizabilityCapabilitiesResponseSchema,
  registryvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRegistryvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/registryvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return registryvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRegistryvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/registryvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return registryvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRegistryvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_registryvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/registryvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return registryvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRegistryvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRegistryvaultizabilityRolloutCheckStatus(
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

export function formatRegistryvaultizabilityAdminAction(action: 'refresh_registryvaultizability_summary') {
  switch (action) {
    case 'refresh_registryvaultizability_summary':
      return 'Refresh registryvaultizability summary'
  }
}

export function formatRegistryvaultizabilityDomain(
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

export async function fetchRegistryvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/registryvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return registryvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
