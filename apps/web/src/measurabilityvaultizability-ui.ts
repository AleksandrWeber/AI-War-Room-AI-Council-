import {
  measurabilityvaultizabilityAdminActionResponseSchema,
  measurabilityvaultizabilityAdminSummaryResponseSchema,
  measurabilityvaultizabilityCapabilitiesResponseSchema,
  measurabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchMeasurabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/measurabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return measurabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchMeasurabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/measurabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return measurabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeMeasurabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_measurabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/measurabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return measurabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatMeasurabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatMeasurabilityvaultizabilityRolloutCheckStatus(
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

export function formatMeasurabilityvaultizabilityAdminAction(action: 'refresh_measurabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_measurabilityvaultizability_summary':
      return 'Refresh measurabilityvaultizability summary'
  }
}

export function formatMeasurabilityvaultizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_memberships' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_memberships':
      return 'Workspace memberships'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchMeasurabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/measurabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return measurabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
