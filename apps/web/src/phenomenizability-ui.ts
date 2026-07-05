import {
  phenomenizabilityAdminActionResponseSchema,
  phenomenizabilityAdminSummaryResponseSchema,
  phenomenizabilityCapabilitiesResponseSchema,
  phenomenizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchPhenomenizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/phenomenizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return phenomenizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchPhenomenizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/phenomenizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return phenomenizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executePhenomenizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_phenomenizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/phenomenizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return phenomenizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatPhenomenizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatPhenomenizabilityRolloutCheckStatus(
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

export function formatPhenomenizabilityAdminAction(action: 'refresh_phenomenizability_summary') {
  switch (action) {
    case 'refresh_phenomenizability_summary':
      return 'Refresh phenomenizability summary'
  }
}

export function formatPhenomenizabilityDomain(
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

export async function fetchPhenomenizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/phenomenizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return phenomenizabilityCapabilitiesResponseSchema.parse(await response.json())
}
