import {
  locatabilityAdminActionResponseSchema,
  locatabilityAdminSummaryResponseSchema,
  locatabilityCapabilitiesResponseSchema,
  locatabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchLocatabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/locatability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return locatabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchLocatabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/locatability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return locatabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeLocatabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_locatability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/locatability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return locatabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatLocatabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatLocatabilityRolloutCheckStatus(
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

export function formatLocatabilityAdminAction(action: 'refresh_locatability_summary') {
  switch (action) {
    case 'refresh_locatability_summary':
      return 'Refresh locatability summary'
  }
}

export function formatLocatabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_provider_credentials' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_provider_credentials':
      return 'Provider credentials'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchLocatabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/locatability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return locatabilityCapabilitiesResponseSchema.parse(await response.json())
}
