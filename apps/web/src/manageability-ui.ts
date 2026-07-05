import {
  manageabilityAdminActionResponseSchema,
  manageabilityAdminSummaryResponseSchema,
  manageabilityCapabilitiesResponseSchema,
  manageabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchManageabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/manageability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return manageabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchManageabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/manageability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return manageabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeManageabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_manageability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/manageability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return manageabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatManageabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatManageabilityRolloutCheckStatus(
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

export function formatManageabilityAdminAction(action: 'refresh_manageability_summary') {
  switch (action) {
    case 'refresh_manageability_summary':
      return 'Refresh manageability summary'
  }
}

export function formatManageabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_notifications' | 'idempotency_keys',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_notifications':
      return 'Billing notifications'
    case 'idempotency_keys':
      return 'Idempotency keys'
  }
}

export async function fetchManageabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/manageability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return manageabilityCapabilitiesResponseSchema.parse(await response.json())
}
