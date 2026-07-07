import {
  discoverabilityvaultizabilityAdminActionResponseSchema,
  discoverabilityvaultizabilityAdminSummaryResponseSchema,
  discoverabilityvaultizabilityCapabilitiesResponseSchema,
  discoverabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDiscoverabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/discoverabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return discoverabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDiscoverabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/discoverabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return discoverabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDiscoverabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_discoverabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/discoverabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return discoverabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDiscoverabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDiscoverabilityvaultizabilityRolloutCheckStatus(
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

export function formatDiscoverabilityvaultizabilityAdminAction(action: 'refresh_discoverabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_discoverabilityvaultizability_summary':
      return 'Refresh discoverabilityvaultizability summary'
  }
}

export function formatDiscoverabilityvaultizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'shield_scans' | 'workspace_provider_credentials',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'shield_scans':
      return 'Shield scans'
    case 'workspace_provider_credentials':
      return 'Provider credentials'
  }
}

export async function fetchDiscoverabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/discoverabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return discoverabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
