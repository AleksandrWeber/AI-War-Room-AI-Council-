import {
  demonstrabilityAdminActionResponseSchema,
  demonstrabilityAdminSummaryResponseSchema,
  demonstrabilityCapabilitiesResponseSchema,
  demonstrabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDemonstrabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/demonstrability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return demonstrabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDemonstrabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/demonstrability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return demonstrabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDemonstrabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_demonstrability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/demonstrability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return demonstrabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDemonstrabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDemonstrabilityRolloutCheckStatus(
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

export function formatDemonstrabilityAdminAction(action: 'refresh_demonstrability_summary') {
  switch (action) {
    case 'refresh_demonstrability_summary':
      return 'Refresh demonstrability summary'
  }
}

export function formatDemonstrabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'run_workflows' | 'billing_notifications',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'run_workflows':
      return 'Run workflows'
    case 'billing_notifications':
      return 'Billing notifications'
  }
}

export async function fetchDemonstrabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/demonstrability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return demonstrabilityCapabilitiesResponseSchema.parse(await response.json())
}
