import {
  restorabilizabilityAdminActionResponseSchema,
  restorabilizabilityAdminSummaryResponseSchema,
  restorabilizabilityCapabilitiesResponseSchema,
  restorabilizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRestorabilizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/restorabilizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return restorabilizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRestorabilizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/restorabilizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return restorabilizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRestorabilizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_restorabilizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/restorabilizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return restorabilizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRestorabilizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRestorabilizabilityRolloutCheckStatus(
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

export function formatRestorabilizabilityAdminAction(action: 'refresh_restorabilizability_summary') {
  switch (action) {
    case 'refresh_restorabilizability_summary':
      return 'Refresh restorabilizability summary'
  }
}

export function formatRestorabilizabilityDomain(
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

export async function fetchRestorabilizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/restorabilizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return restorabilizabilityCapabilitiesResponseSchema.parse(await response.json())
}
