import {
  customizabilityAdminActionResponseSchema,
  customizabilityAdminSummaryResponseSchema,
  customizabilityCapabilitiesResponseSchema,
  customizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCustomizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/customizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return customizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCustomizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/customizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return customizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCustomizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_customizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/customizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return customizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCustomizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCustomizabilityRolloutCheckStatus(
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

export function formatCustomizabilityAdminAction(action: 'refresh_customizability_summary') {
  switch (action) {
    case 'refresh_customizability_summary':
      return 'Refresh customizability summary'
  }
}

export function formatCustomizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'run_workflows' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'run_workflows':
      return 'Run workflows'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchCustomizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/customizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return customizabilityCapabilitiesResponseSchema.parse(await response.json())
}
