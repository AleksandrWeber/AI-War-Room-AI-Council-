import {
  hierarchizabilityAdminActionResponseSchema,
  hierarchizabilityAdminSummaryResponseSchema,
  hierarchizabilityCapabilitiesResponseSchema,
  hierarchizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchHierarchizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/hierarchizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return hierarchizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchHierarchizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/hierarchizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return hierarchizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeHierarchizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_hierarchizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/hierarchizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return hierarchizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatHierarchizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatHierarchizabilityRolloutCheckStatus(
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

export function formatHierarchizabilityAdminAction(action: 'refresh_hierarchizability_summary') {
  switch (action) {
    case 'refresh_hierarchizability_summary':
      return 'Refresh hierarchizability summary'
  }
}

export function formatHierarchizabilityDomain(
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

export async function fetchHierarchizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/hierarchizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return hierarchizabilityCapabilitiesResponseSchema.parse(await response.json())
}
