import {
  archetypizabilityAdminActionResponseSchema,
  archetypizabilityAdminSummaryResponseSchema,
  archetypizabilityCapabilitiesResponseSchema,
  archetypizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchArchetypizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/archetypizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return archetypizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchArchetypizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/archetypizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return archetypizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeArchetypizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_archetypizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/archetypizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return archetypizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatArchetypizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatArchetypizabilityRolloutCheckStatus(
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

export function formatArchetypizabilityAdminAction(action: 'refresh_archetypizability_summary') {
  switch (action) {
    case 'refresh_archetypizability_summary':
      return 'Refresh archetypizability summary'
  }
}

export function formatArchetypizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_records' | 'billing_invoices',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_records':
      return 'Billing records'
    case 'billing_invoices':
      return 'Billing invoices'
  }
}

export async function fetchArchetypizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/archetypizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return archetypizabilityCapabilitiesResponseSchema.parse(await response.json())
}
