import {
  extensibilityAdminActionResponseSchema,
  extensibilityAdminSummaryResponseSchema,
  extensibilityCapabilitiesResponseSchema,
  extensibilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchExtensibilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/extensibility/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return extensibilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchExtensibilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/extensibility/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return extensibilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeExtensibilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_extensibility_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/extensibility/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return extensibilityAdminActionResponseSchema.parse(await response.json())
}

export function formatExtensibilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatExtensibilityRolloutCheckStatus(
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

export function formatExtensibilityAdminAction(action: 'refresh_extensibility_summary') {
  switch (action) {
    case 'refresh_extensibility_summary':
      return 'Refresh extensibility summary'
  }
}

export function formatExtensibilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'agent_outputs' | 'artifacts',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'agent_outputs':
      return 'Agent outputs'
    case 'artifacts':
      return 'Artifacts'
  }
}

export async function fetchExtensibilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/extensibility/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return extensibilityCapabilitiesResponseSchema.parse(await response.json())
}
