import {
  rollbackabilizabilityAdminActionResponseSchema,
  rollbackabilizabilityAdminSummaryResponseSchema,
  rollbackabilizabilityCapabilitiesResponseSchema,
  rollbackabilizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRollbackabilizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/rollbackabilizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return rollbackabilizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRollbackabilizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/rollbackabilizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return rollbackabilizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRollbackabilizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_rollbackabilizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/rollbackabilizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return rollbackabilizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRollbackabilizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRollbackabilizabilityRolloutCheckStatus(
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

export function formatRollbackabilizabilityAdminAction(action: 'refresh_rollbackabilizability_summary') {
  switch (action) {
    case 'refresh_rollbackabilizability_summary':
      return 'Refresh rollbackabilizability summary'
  }
}

export function formatRollbackabilizabilityDomain(
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

export async function fetchRollbackabilizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/rollbackabilizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return rollbackabilizabilityCapabilitiesResponseSchema.parse(await response.json())
}
