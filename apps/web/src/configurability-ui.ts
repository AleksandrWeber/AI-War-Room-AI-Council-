import {
  configurabilityAdminActionResponseSchema,
  configurabilityAdminSummaryResponseSchema,
  configurabilityCapabilitiesResponseSchema,
  configurabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchConfigurabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/configurability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return configurabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchConfigurabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/configurability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return configurabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeConfigurabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_configurability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/configurability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return configurabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatConfigurabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatConfigurabilityRolloutCheckStatus(
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

export function formatConfigurabilityAdminAction(action: 'refresh_configurability_summary') {
  switch (action) {
    case 'refresh_configurability_summary':
      return 'Refresh configurability summary'
  }
}

export function formatConfigurabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_provider_credentials' | 'billing_meter_usage_reports',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_provider_credentials':
      return 'Provider credentials'
    case 'billing_meter_usage_reports':
      return 'Meter usage reports'
  }
}

export async function fetchConfigurabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/configurability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return configurabilityCapabilitiesResponseSchema.parse(await response.json())
}
