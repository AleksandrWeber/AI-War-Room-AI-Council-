import {
  archiveizabilityAdminActionResponseSchema,
  archiveizabilityAdminSummaryResponseSchema,
  archiveizabilityCapabilitiesResponseSchema,
  archiveizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchArchiveizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/archiveizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return archiveizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchArchiveizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/archiveizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return archiveizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeArchiveizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_archiveizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/archiveizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return archiveizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatArchiveizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatArchiveizabilityRolloutCheckStatus(
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

export function formatArchiveizabilityAdminAction(action: 'refresh_archiveizability_summary') {
  switch (action) {
    case 'refresh_archiveizability_summary':
      return 'Refresh archiveizability summary'
  }
}

export function formatArchiveizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_notifications' | 'billing_webhook_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_notifications':
      return 'Billing notifications'
    case 'billing_webhook_events':
      return 'Billing webhook events'
  }
}

export async function fetchArchiveizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/archiveizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return archiveizabilityCapabilitiesResponseSchema.parse(await response.json())
}
