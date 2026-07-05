import {
  signifiabilityAdminActionResponseSchema,
  signifiabilityAdminSummaryResponseSchema,
  signifiabilityCapabilitiesResponseSchema,
  signifiabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSignifiabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/signifiability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return signifiabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSignifiabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/signifiability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return signifiabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSignifiabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_signifiability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/signifiability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return signifiabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSignifiabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSignifiabilityRolloutCheckStatus(
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

export function formatSignifiabilityAdminAction(action: 'refresh_signifiability_summary') {
  switch (action) {
    case 'refresh_signifiability_summary':
      return 'Refresh signifiability summary'
  }
}

export function formatSignifiabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_webhook_events' | 'billing_records',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_webhook_events':
      return 'Billing webhook events'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchSignifiabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/signifiability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return signifiabilityCapabilitiesResponseSchema.parse(await response.json())
}
