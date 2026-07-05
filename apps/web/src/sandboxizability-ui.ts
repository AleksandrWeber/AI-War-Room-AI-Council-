import {
  sandboxizabilityAdminActionResponseSchema,
  sandboxizabilityAdminSummaryResponseSchema,
  sandboxizabilityCapabilitiesResponseSchema,
  sandboxizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSandboxizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/sandboxizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return sandboxizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSandboxizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/sandboxizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return sandboxizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSandboxizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_sandboxizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/sandboxizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return sandboxizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSandboxizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSandboxizabilityRolloutCheckStatus(
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

export function formatSandboxizabilityAdminAction(action: 'refresh_sandboxizability_summary') {
  switch (action) {
    case 'refresh_sandboxizability_summary':
      return 'Refresh sandboxizability summary'
  }
}

export function formatSandboxizabilityDomain(
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

export async function fetchSandboxizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/sandboxizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return sandboxizabilityCapabilitiesResponseSchema.parse(await response.json())
}
