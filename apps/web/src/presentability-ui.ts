import {
  presentabilityAdminActionResponseSchema,
  presentabilityAdminSummaryResponseSchema,
  presentabilityCapabilitiesResponseSchema,
  presentabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchPresentabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/presentability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return presentabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchPresentabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/presentability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return presentabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executePresentabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_presentability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/presentability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return presentabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatPresentabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatPresentabilityRolloutCheckStatus(
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

export function formatPresentabilityAdminAction(action: 'refresh_presentability_summary') {
  switch (action) {
    case 'refresh_presentability_summary':
      return 'Refresh presentability summary'
  }
}

export function formatPresentabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'usage_events' | 'billing_meter_usage_reports',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'usage_events':
      return 'Usage events'
    case 'billing_meter_usage_reports':
      return 'Meter usage reports'
  }
}

export async function fetchPresentabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/presentability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return presentabilityCapabilitiesResponseSchema.parse(await response.json())
}
