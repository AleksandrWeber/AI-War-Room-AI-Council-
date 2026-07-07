import {
  monitorabilityvaultizabilityAdminActionResponseSchema,
  monitorabilityvaultizabilityAdminSummaryResponseSchema,
  monitorabilityvaultizabilityCapabilitiesResponseSchema,
  monitorabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchMonitorabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/monitorabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return monitorabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchMonitorabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/monitorabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return monitorabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeMonitorabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_monitorabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/monitorabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return monitorabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatMonitorabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatMonitorabilityvaultizabilityRolloutCheckStatus(
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

export function formatMonitorabilityvaultizabilityAdminAction(action: 'refresh_monitorabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_monitorabilityvaultizability_summary':
      return 'Refresh monitorabilityvaultizability summary'
  }
}

export function formatMonitorabilityvaultizabilityDomain(
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

export async function fetchMonitorabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/monitorabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return monitorabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
