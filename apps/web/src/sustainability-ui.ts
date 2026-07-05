import {
  sustainabilityAdminActionResponseSchema,
  sustainabilityAdminSummaryResponseSchema,
  sustainabilityCapabilitiesResponseSchema,
  sustainabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSustainabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/sustainability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return sustainabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSustainabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/sustainability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return sustainabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSustainabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_sustainability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/sustainability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return sustainabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSustainabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSustainabilityRolloutCheckStatus(
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

export function formatSustainabilityAdminAction(
  action: 'refresh_sustainability_summary',
) {
  switch (action) {
    case 'refresh_sustainability_summary':
      return 'Refresh sustainability summary'
  }
}

export function formatSustainabilityDomain(
  domain:
    | 'completed_runs'
    | 'failed_runs'
    | 'billing_records'
    | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_records':
      return 'Billing records'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchSustainabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/sustainability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return sustainabilityCapabilitiesResponseSchema.parse(await response.json())
}
