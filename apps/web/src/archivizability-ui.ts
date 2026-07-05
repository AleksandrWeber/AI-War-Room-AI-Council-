import {
  archivizabilityAdminActionResponseSchema,
  archivizabilityAdminSummaryResponseSchema,
  archivizabilityCapabilitiesResponseSchema,
  archivizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchArchivizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/archivizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return archivizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchArchivizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/archivizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return archivizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeArchivizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_archivizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/archivizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return archivizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatArchivizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatArchivizabilityRolloutCheckStatus(
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

export function formatArchivizabilityAdminAction(action: 'refresh_archivizability_summary') {
  switch (action) {
    case 'refresh_archivizability_summary':
      return 'Refresh archivizability summary'
  }
}

export function formatArchivizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_webhook_events' | 'billing_records',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_webhook_events':
      return 'Billing webhook events'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchArchivizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/archivizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return archivizabilityCapabilitiesResponseSchema.parse(await response.json())
}
