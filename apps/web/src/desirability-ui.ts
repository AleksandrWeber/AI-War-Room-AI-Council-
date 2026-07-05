import {
  desirabilityAdminActionResponseSchema,
  desirabilityAdminSummaryResponseSchema,
  desirabilityCapabilitiesResponseSchema,
  desirabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDesirabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/desirability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return desirabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDesirabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/desirability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return desirabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDesirabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_desirability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/desirability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return desirabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDesirabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDesirabilityRolloutCheckStatus(
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

export function formatDesirabilityAdminAction(action: 'refresh_desirability_summary') {
  switch (action) {
    case 'refresh_desirability_summary':
      return 'Refresh desirability summary'
  }
}

export function formatDesirabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'usage_events' | 'billing_notifications',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'usage_events':
      return 'Usage events'
    case 'billing_notifications':
      return 'Billing notifications'
  }
}

export async function fetchDesirabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/desirability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return desirabilityCapabilitiesResponseSchema.parse(await response.json())
}
