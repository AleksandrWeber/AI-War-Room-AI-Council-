import {
  responsivenessAdminActionResponseSchema,
  responsivenessAdminSummaryResponseSchema,
  responsivenessCapabilitiesResponseSchema,
  responsivenessRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchResponsivenessRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/responsiveness/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return responsivenessRolloutResponseSchema.parse(await response.json())
}

export async function fetchResponsivenessAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/responsiveness/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return responsivenessAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeResponsivenessAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_responsiveness_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/responsiveness/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return responsivenessAdminActionResponseSchema.parse(await response.json())
}

export function formatResponsivenessRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatResponsivenessRolloutCheckStatus(
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

export function formatResponsivenessAdminAction(action: 'refresh_responsiveness_summary') {
  switch (action) {
    case 'refresh_responsiveness_summary':
      return 'Refresh responsiveness summary'
  }
}

export function formatResponsivenessDomain(
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

export async function fetchResponsivenessCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/responsiveness/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return responsivenessCapabilitiesResponseSchema.parse(await response.json())
}
