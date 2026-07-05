import {
  perceptibilityAdminActionResponseSchema,
  perceptibilityAdminSummaryResponseSchema,
  perceptibilityCapabilitiesResponseSchema,
  perceptibilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchPerceptibilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/perceptibility/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return perceptibilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchPerceptibilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/perceptibility/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return perceptibilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executePerceptibilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_perceptibility_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/perceptibility/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return perceptibilityAdminActionResponseSchema.parse(await response.json())
}

export function formatPerceptibilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatPerceptibilityRolloutCheckStatus(
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

export function formatPerceptibilityAdminAction(action: 'refresh_perceptibility_summary') {
  switch (action) {
    case 'refresh_perceptibility_summary':
      return 'Refresh perceptibility summary'
  }
}

export function formatPerceptibilityDomain(
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

export async function fetchPerceptibilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/perceptibility/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return perceptibilityCapabilitiesResponseSchema.parse(await response.json())
}
