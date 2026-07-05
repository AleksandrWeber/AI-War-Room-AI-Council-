import {
  exportizabilityAdminActionResponseSchema,
  exportizabilityAdminSummaryResponseSchema,
  exportizabilityCapabilitiesResponseSchema,
  exportizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchExportizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/exportizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return exportizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchExportizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/exportizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return exportizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeExportizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_exportizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/exportizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return exportizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatExportizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatExportizabilityRolloutCheckStatus(
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

export function formatExportizabilityAdminAction(action: 'refresh_exportizability_summary') {
  switch (action) {
    case 'refresh_exportizability_summary':
      return 'Refresh exportizability summary'
  }
}

export function formatExportizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_usage_limits' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_usage_limits':
      return 'Workspace usage limits'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchExportizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/exportizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return exportizabilityCapabilitiesResponseSchema.parse(await response.json())
}
