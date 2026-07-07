import {
  customizabilityvaultizabilityAdminActionResponseSchema,
  customizabilityvaultizabilityAdminSummaryResponseSchema,
  customizabilityvaultizabilityCapabilitiesResponseSchema,
  customizabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCustomizabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/customizabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return customizabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCustomizabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/customizabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return customizabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCustomizabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_customizabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/customizabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return customizabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCustomizabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCustomizabilityvaultizabilityRolloutCheckStatus(
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

export function formatCustomizabilityvaultizabilityAdminAction(action: 'refresh_customizabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_customizabilityvaultizability_summary':
      return 'Refresh customizabilityvaultizability summary'
  }
}

export function formatCustomizabilityvaultizabilityDomain(
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

export async function fetchCustomizabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/customizabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return customizabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
