import {
  warrantabilityAdminActionResponseSchema,
  warrantabilityAdminSummaryResponseSchema,
  warrantabilityCapabilitiesResponseSchema,
  warrantabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchWarrantabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/warrantability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return warrantabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchWarrantabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/warrantability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return warrantabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeWarrantabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_warrantability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/warrantability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return warrantabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatWarrantabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatWarrantabilityRolloutCheckStatus(
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

export function formatWarrantabilityAdminAction(action: 'refresh_warrantability_summary') {
  switch (action) {
    case 'refresh_warrantability_summary':
      return 'Refresh warrantability summary'
  }
}

export function formatWarrantabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'shield_scans' | 'run_workflows',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'shield_scans':
      return 'Shield scans'
    case 'run_workflows':
      return 'Run workflows'
  }
}

export async function fetchWarrantabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/warrantability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return warrantabilityCapabilitiesResponseSchema.parse(await response.json())
}
