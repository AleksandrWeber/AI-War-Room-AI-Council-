import {
  registryjournalizabilityAdminActionResponseSchema,
  registryjournalizabilityAdminSummaryResponseSchema,
  registryjournalizabilityCapabilitiesResponseSchema,
  registryjournalizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRegistryjournalizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/registryjournalizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return registryjournalizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRegistryjournalizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/registryjournalizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return registryjournalizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRegistryjournalizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_registryjournalizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/registryjournalizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return registryjournalizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRegistryjournalizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRegistryjournalizabilityRolloutCheckStatus(
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

export function formatRegistryjournalizabilityAdminAction(action: 'refresh_registryjournalizability_summary') {
  switch (action) {
    case 'refresh_registryjournalizability_summary':
      return 'Refresh registryjournalizability summary'
  }
}

export function formatRegistryjournalizabilityDomain(
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

export async function fetchRegistryjournalizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/registryjournalizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return registryjournalizabilityCapabilitiesResponseSchema.parse(await response.json())
}
