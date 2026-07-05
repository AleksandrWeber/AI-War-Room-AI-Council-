import {
  channelizabilityAdminActionResponseSchema,
  channelizabilityAdminSummaryResponseSchema,
  channelizabilityCapabilitiesResponseSchema,
  channelizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchChannelizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/channelizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return channelizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchChannelizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/channelizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return channelizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeChannelizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_channelizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/channelizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return channelizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatChannelizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatChannelizabilityRolloutCheckStatus(
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

export function formatChannelizabilityAdminAction(action: 'refresh_channelizability_summary') {
  switch (action) {
    case 'refresh_channelizability_summary':
      return 'Refresh channelizability summary'
  }
}

export function formatChannelizabilityDomain(
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

export async function fetchChannelizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/channelizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return channelizabilityCapabilitiesResponseSchema.parse(await response.json())
}
