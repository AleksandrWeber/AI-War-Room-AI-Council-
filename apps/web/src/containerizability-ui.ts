import {
  containerizabilityAdminActionResponseSchema,
  containerizabilityAdminSummaryResponseSchema,
  containerizabilityCapabilitiesResponseSchema,
  containerizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchContainerizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/containerizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return containerizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchContainerizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/containerizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return containerizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeContainerizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_containerizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/containerizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return containerizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatContainerizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatContainerizabilityRolloutCheckStatus(
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

export function formatContainerizabilityAdminAction(action: 'refresh_containerizability_summary') {
  switch (action) {
    case 'refresh_containerizability_summary':
      return 'Refresh containerizability summary'
  }
}

export function formatContainerizabilityDomain(
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

export async function fetchContainerizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/containerizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return containerizabilityCapabilitiesResponseSchema.parse(await response.json())
}
