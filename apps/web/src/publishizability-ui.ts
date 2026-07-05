import {
  publishizabilityAdminActionResponseSchema,
  publishizabilityAdminSummaryResponseSchema,
  publishizabilityCapabilitiesResponseSchema,
  publishizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchPublishizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/publishizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return publishizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchPublishizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/publishizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return publishizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executePublishizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_publishizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/publishizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return publishizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatPublishizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatPublishizabilityRolloutCheckStatus(
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

export function formatPublishizabilityAdminAction(action: 'refresh_publishizability_summary') {
  switch (action) {
    case 'refresh_publishizability_summary':
      return 'Refresh publishizability summary'
  }
}

export function formatPublishizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_meter_usage_reports' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_meter_usage_reports':
      return 'Meter usage reports'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchPublishizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/publishizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return publishizabilityCapabilitiesResponseSchema.parse(await response.json())
}
