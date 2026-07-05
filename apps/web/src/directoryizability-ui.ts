import {
  directoryizabilityAdminActionResponseSchema,
  directoryizabilityAdminSummaryResponseSchema,
  directoryizabilityCapabilitiesResponseSchema,
  directoryizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDirectoryizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/directoryizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return directoryizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDirectoryizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/directoryizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return directoryizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDirectoryizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_directoryizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/directoryizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return directoryizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDirectoryizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDirectoryizabilityRolloutCheckStatus(
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

export function formatDirectoryizabilityAdminAction(action: 'refresh_directoryizability_summary') {
  switch (action) {
    case 'refresh_directoryizability_summary':
      return 'Refresh directoryizability summary'
  }
}

export function formatDirectoryizabilityDomain(
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

export async function fetchDirectoryizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/directoryizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return directoryizabilityCapabilitiesResponseSchema.parse(await response.json())
}
