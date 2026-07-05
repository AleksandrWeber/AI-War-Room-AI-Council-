import {
  streamizabilityAdminActionResponseSchema,
  streamizabilityAdminSummaryResponseSchema,
  streamizabilityCapabilitiesResponseSchema,
  streamizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchStreamizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/streamizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return streamizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchStreamizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/streamizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return streamizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeStreamizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_streamizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/streamizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return streamizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatStreamizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatStreamizabilityRolloutCheckStatus(
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

export function formatStreamizabilityAdminAction(action: 'refresh_streamizability_summary') {
  switch (action) {
    case 'refresh_streamizability_summary':
      return 'Refresh streamizability summary'
  }
}

export function formatStreamizabilityDomain(
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

export async function fetchStreamizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/streamizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return streamizabilityCapabilitiesResponseSchema.parse(await response.json())
}
