import {
  accessibilityAdminActionResponseSchema,
  accessibilityAdminSummaryResponseSchema,
  accessibilityCapabilitiesResponseSchema,
  accessibilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAccessibilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/accessibility/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return accessibilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAccessibilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/accessibility/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return accessibilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAccessibilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_accessibility_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/accessibility/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return accessibilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAccessibilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAccessibilityRolloutCheckStatus(
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

export function formatAccessibilityAdminAction(action: 'refresh_accessibility_summary') {
  switch (action) {
    case 'refresh_accessibility_summary':
      return 'Refresh accessibility summary'
  }
}

export function formatAccessibilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'idempotency_keys' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'idempotency_keys':
      return 'Idempotency keys'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchAccessibilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/accessibility/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return accessibilityCapabilitiesResponseSchema.parse(await response.json())
}
