import {
  registrationizabilityAdminActionResponseSchema,
  registrationizabilityAdminSummaryResponseSchema,
  registrationizabilityCapabilitiesResponseSchema,
  registrationizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRegistrationizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/registrationizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return registrationizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRegistrationizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/registrationizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return registrationizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRegistrationizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_registrationizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/registrationizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return registrationizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRegistrationizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRegistrationizabilityRolloutCheckStatus(
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

export function formatRegistrationizabilityAdminAction(action: 'refresh_registrationizability_summary') {
  switch (action) {
    case 'refresh_registrationizability_summary':
      return 'Refresh registrationizability summary'
  }
}

export function formatRegistrationizabilityDomain(
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

export async function fetchRegistrationizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/registrationizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return registrationizabilityCapabilitiesResponseSchema.parse(await response.json())
}
