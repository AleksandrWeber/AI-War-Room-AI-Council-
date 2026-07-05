import {
  confirmabilityAdminActionResponseSchema,
  confirmabilityAdminSummaryResponseSchema,
  confirmabilityCapabilitiesResponseSchema,
  confirmabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchConfirmabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/confirmability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return confirmabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchConfirmabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/confirmability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return confirmabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeConfirmabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_confirmability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/confirmability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return confirmabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatConfirmabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatConfirmabilityRolloutCheckStatus(
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

export function formatConfirmabilityAdminAction(action: 'refresh_confirmability_summary') {
  switch (action) {
    case 'refresh_confirmability_summary':
      return 'Refresh confirmability summary'
  }
}

export function formatConfirmabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_notifications' | 'workspace_usage_limits',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_notifications':
      return 'Billing notifications'
    case 'workspace_usage_limits':
      return 'Workspace usage limits'
  }
}

export async function fetchConfirmabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/confirmability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return confirmabilityCapabilitiesResponseSchema.parse(await response.json())
}
