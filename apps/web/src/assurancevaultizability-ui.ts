import {
  assurancevaultizabilityAdminActionResponseSchema,
  assurancevaultizabilityAdminSummaryResponseSchema,
  assurancevaultizabilityCapabilitiesResponseSchema,
  assurancevaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAssurancevaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/assurancevaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return assurancevaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAssurancevaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/assurancevaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return assurancevaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAssurancevaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_assurancevaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/assurancevaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return assurancevaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAssurancevaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAssurancevaultizabilityRolloutCheckStatus(
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

export function formatAssurancevaultizabilityAdminAction(action: 'refresh_assurancevaultizability_summary') {
  switch (action) {
    case 'refresh_assurancevaultizability_summary':
      return 'Refresh assurancevaultizability summary'
  }
}

export function formatAssurancevaultizabilityDomain(
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

export async function fetchAssurancevaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/assurancevaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return assurancevaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
