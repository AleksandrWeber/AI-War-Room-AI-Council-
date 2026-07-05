import {
  rhetorizabilityAdminActionResponseSchema,
  rhetorizabilityAdminSummaryResponseSchema,
  rhetorizabilityCapabilitiesResponseSchema,
  rhetorizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRhetorizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/rhetorizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return rhetorizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRhetorizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/rhetorizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return rhetorizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRhetorizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_rhetorizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/rhetorizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return rhetorizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRhetorizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRhetorizabilityRolloutCheckStatus(
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

export function formatRhetorizabilityAdminAction(action: 'refresh_rhetorizability_summary') {
  switch (action) {
    case 'refresh_rhetorizability_summary':
      return 'Refresh rhetorizability summary'
  }
}

export function formatRhetorizabilityDomain(
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

export async function fetchRhetorizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/rhetorizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return rhetorizabilityCapabilitiesResponseSchema.parse(await response.json())
}
