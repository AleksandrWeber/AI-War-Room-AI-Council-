import {
  stabilizabilityAdminActionResponseSchema,
  stabilizabilityAdminSummaryResponseSchema,
  stabilizabilityCapabilitiesResponseSchema,
  stabilizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchStabilizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/stabilizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return stabilizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchStabilizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/stabilizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return stabilizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeStabilizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_stabilizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/stabilizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return stabilizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatStabilizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatStabilizabilityRolloutCheckStatus(
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

export function formatStabilizabilityAdminAction(action: 'refresh_stabilizability_summary') {
  switch (action) {
    case 'refresh_stabilizability_summary':
      return 'Refresh stabilizability summary'
  }
}

export function formatStabilizabilityDomain(
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

export async function fetchStabilizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/stabilizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return stabilizabilityCapabilitiesResponseSchema.parse(await response.json())
}
