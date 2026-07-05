import {
  categorizabilityAdminActionResponseSchema,
  categorizabilityAdminSummaryResponseSchema,
  categorizabilityCapabilitiesResponseSchema,
  categorizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCategorizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/categorizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return categorizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCategorizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/categorizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return categorizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCategorizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_categorizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/categorizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return categorizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCategorizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCategorizabilityRolloutCheckStatus(
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

export function formatCategorizabilityAdminAction(action: 'refresh_categorizability_summary') {
  switch (action) {
    case 'refresh_categorizability_summary':
      return 'Refresh categorizability summary'
  }
}

export function formatCategorizabilityDomain(
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

export async function fetchCategorizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/categorizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return categorizabilityCapabilitiesResponseSchema.parse(await response.json())
}
