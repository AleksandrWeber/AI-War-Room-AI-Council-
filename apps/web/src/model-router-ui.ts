import {
  modelHealthAdminActionResponseSchema,
  modelHealthAdminSummaryResponseSchema,
  modelRouterCapabilitiesResponseSchema,
  modelRouterRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchModelRouterCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/model-router/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return modelRouterCapabilitiesResponseSchema.parse(await response.json())
}

export async function fetchModelRouterRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/model-router/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return modelRouterRolloutResponseSchema.parse(await response.json())
}

export async function fetchModelHealthAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/model-router/workspace/${encodeURIComponent(workspaceId)}/admin`,
    {
      headers,
    },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return modelHealthAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeModelHealthAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: {
    action: 'recover_model'
    modelId: string
  },
) {
  const response = await fetch(
    `${apiBaseUrl}/model-router/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return modelHealthAdminActionResponseSchema.parse(await response.json())
}

export function formatModelRouterRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatModelRouterRolloutCheckStatus(
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

export function formatModelHealthStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function formatModelLifecycleStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}
