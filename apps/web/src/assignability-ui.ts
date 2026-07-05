import {
  assignabilityAdminActionResponseSchema,
  assignabilityAdminSummaryResponseSchema,
  assignabilityCapabilitiesResponseSchema,
  assignabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAssignabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/assignability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return assignabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAssignabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/assignability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return assignabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAssignabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_assignability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/assignability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return assignabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAssignabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAssignabilityRolloutCheckStatus(
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

export function formatAssignabilityAdminAction(action: 'refresh_assignability_summary') {
  switch (action) {
    case 'refresh_assignability_summary':
      return 'Refresh assignability summary'
  }
}

export function formatAssignabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_memberships' | 'billing_notifications',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_memberships':
      return 'Workspace memberships'
    case 'billing_notifications':
      return 'Billing notifications'
  }
}

export async function fetchAssignabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/assignability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return assignabilityCapabilitiesResponseSchema.parse(await response.json())
}
