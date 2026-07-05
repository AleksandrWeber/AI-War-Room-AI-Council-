import {
  restoreizabilityAdminActionResponseSchema,
  restoreizabilityAdminSummaryResponseSchema,
  restoreizabilityCapabilitiesResponseSchema,
  restoreizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRestoreizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/restoreizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return restoreizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRestoreizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/restoreizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return restoreizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRestoreizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_restoreizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/restoreizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return restoreizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRestoreizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRestoreizabilityRolloutCheckStatus(
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

export function formatRestoreizabilityAdminAction(action: 'refresh_restoreizability_summary') {
  switch (action) {
    case 'refresh_restoreizability_summary':
      return 'Refresh restoreizability summary'
  }
}

export function formatRestoreizabilityDomain(
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

export async function fetchRestoreizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/restoreizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return restoreizabilityCapabilitiesResponseSchema.parse(await response.json())
}
