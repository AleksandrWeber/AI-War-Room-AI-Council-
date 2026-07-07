import {
  identityproofizabilityAdminActionResponseSchema,
  identityproofizabilityAdminSummaryResponseSchema,
  identityproofizabilityCapabilitiesResponseSchema,
  identityproofizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchIdentityproofizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/identityproofizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return identityproofizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchIdentityproofizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/identityproofizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return identityproofizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeIdentityproofizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_identityproofizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/identityproofizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return identityproofizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatIdentityproofizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatIdentityproofizabilityRolloutCheckStatus(
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

export function formatIdentityproofizabilityAdminAction(action: 'refresh_identityproofizability_summary') {
  switch (action) {
    case 'refresh_identityproofizability_summary':
      return 'Refresh identityproofizability summary'
  }
}

export function formatIdentityproofizabilityDomain(
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

export async function fetchIdentityproofizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/identityproofizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return identityproofizabilityCapabilitiesResponseSchema.parse(await response.json())
}
