import {
  autoscalingizabilityAdminActionResponseSchema,
  autoscalingizabilityAdminSummaryResponseSchema,
  autoscalingizabilityCapabilitiesResponseSchema,
  autoscalingizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAutoscalingizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/autoscalingizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return autoscalingizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAutoscalingizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/autoscalingizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return autoscalingizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAutoscalingizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_autoscalingizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/autoscalingizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return autoscalingizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAutoscalingizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAutoscalingizabilityRolloutCheckStatus(
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

export function formatAutoscalingizabilityAdminAction(action: 'refresh_autoscalingizability_summary') {
  switch (action) {
    case 'refresh_autoscalingizability_summary':
      return 'Refresh autoscalingizability summary'
  }
}

export function formatAutoscalingizabilityDomain(
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

export async function fetchAutoscalingizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/autoscalingizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return autoscalingizabilityCapabilitiesResponseSchema.parse(await response.json())
}
