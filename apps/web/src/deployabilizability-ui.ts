import {
  deployabilizabilityAdminActionResponseSchema,
  deployabilizabilityAdminSummaryResponseSchema,
  deployabilizabilityCapabilitiesResponseSchema,
  deployabilizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDeployabilizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/deployabilizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deployabilizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDeployabilizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/deployabilizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deployabilizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDeployabilizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_deployabilizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/deployabilizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return deployabilizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDeployabilizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDeployabilizabilityRolloutCheckStatus(
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

export function formatDeployabilizabilityAdminAction(action: 'refresh_deployabilizability_summary') {
  switch (action) {
    case 'refresh_deployabilizability_summary':
      return 'Refresh deployabilizability summary'
  }
}

export function formatDeployabilizabilityDomain(
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

export async function fetchDeployabilizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/deployabilizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deployabilizabilityCapabilitiesResponseSchema.parse(await response.json())
}
