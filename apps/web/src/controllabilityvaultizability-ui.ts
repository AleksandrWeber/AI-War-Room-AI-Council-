import {
  controllabilityvaultizabilityAdminActionResponseSchema,
  controllabilityvaultizabilityAdminSummaryResponseSchema,
  controllabilityvaultizabilityCapabilitiesResponseSchema,
  controllabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchControllabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/controllabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return controllabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchControllabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/controllabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return controllabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeControllabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_controllabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/controllabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return controllabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatControllabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatControllabilityvaultizabilityRolloutCheckStatus(
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

export function formatControllabilityvaultizabilityAdminAction(action: 'refresh_controllabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_controllabilityvaultizability_summary':
      return 'Refresh controllabilityvaultizability summary'
  }
}

export function formatControllabilityvaultizabilityDomain(
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

export async function fetchControllabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/controllabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return controllabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
