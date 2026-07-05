import {
  deploymentAdminActionResponseSchema,
  deploymentAdminSummaryResponseSchema,
  deploymentCapabilitiesResponseSchema,
  deploymentRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDeploymentRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/deployment/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deploymentRolloutResponseSchema.parse(await response.json())
}

export async function fetchDeploymentAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/deployment/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deploymentAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDeploymentAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_deployment_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/deployment/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return deploymentAdminActionResponseSchema.parse(await response.json())
}

export function formatDeploymentRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDeploymentRolloutCheckStatus(
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

export function formatDeploymentAdminAction(action: 'refresh_deployment_summary') {
  switch (action) {
    case 'refresh_deployment_summary':
      return 'Refresh deployment summary'
  }
}

export function formatDependencyStatus(status: 'up' | 'down') {
  switch (status) {
    case 'up':
      return 'Up'
    case 'down':
      return 'Down'
  }
}

export function formatDependencyName(name: 'postgres' | 'redis') {
  switch (name) {
    case 'postgres':
      return 'PostgreSQL'
    case 'redis':
      return 'Redis'
  }
}

export async function fetchDeploymentCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/deployment/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deploymentCapabilitiesResponseSchema.parse(await response.json())
}
