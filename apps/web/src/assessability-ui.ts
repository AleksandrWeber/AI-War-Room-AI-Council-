import {
  assessabilityAdminActionResponseSchema,
  assessabilityAdminSummaryResponseSchema,
  assessabilityCapabilitiesResponseSchema,
  assessabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAssessabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/assessability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return assessabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAssessabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/assessability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return assessabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAssessabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_assessability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/assessability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return assessabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAssessabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAssessabilityRolloutCheckStatus(
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

export function formatAssessabilityAdminAction(action: 'refresh_assessability_summary') {
  switch (action) {
    case 'refresh_assessability_summary':
      return 'Refresh assessability summary'
  }
}

export function formatAssessabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'model_health_events' | 'billing_records',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'model_health_events':
      return 'Model health events'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchAssessabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/assessability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return assessabilityCapabilitiesResponseSchema.parse(await response.json())
}
