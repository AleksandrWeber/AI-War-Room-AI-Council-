import {
  followerizabilityAdminActionResponseSchema,
  followerizabilityAdminSummaryResponseSchema,
  followerizabilityCapabilitiesResponseSchema,
  followerizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchFollowerizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/followerizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return followerizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchFollowerizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/followerizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return followerizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeFollowerizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_followerizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/followerizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return followerizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatFollowerizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatFollowerizabilityRolloutCheckStatus(
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

export function formatFollowerizabilityAdminAction(action: 'refresh_followerizability_summary') {
  switch (action) {
    case 'refresh_followerizability_summary':
      return 'Refresh followerizability summary'
  }
}

export function formatFollowerizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_provider_credentials' | 'model_registry_entries',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_provider_credentials':
      return 'Provider credentials'
    case 'model_registry_entries':
      return 'Model registry entries'
  }
}

export async function fetchFollowerizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/followerizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return followerizabilityCapabilitiesResponseSchema.parse(await response.json())
}
