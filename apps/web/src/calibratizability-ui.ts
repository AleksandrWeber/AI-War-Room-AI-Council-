import {
  calibratizabilityAdminActionResponseSchema,
  calibratizabilityAdminSummaryResponseSchema,
  calibratizabilityCapabilitiesResponseSchema,
  calibratizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCalibratizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/calibratizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return calibratizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCalibratizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/calibratizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return calibratizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCalibratizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_calibratizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/calibratizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return calibratizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCalibratizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCalibratizabilityRolloutCheckStatus(
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

export function formatCalibratizabilityAdminAction(action: 'refresh_calibratizability_summary') {
  switch (action) {
    case 'refresh_calibratizability_summary':
      return 'Refresh calibratizability summary'
  }
}

export function formatCalibratizabilityDomain(
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

export async function fetchCalibratizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/calibratizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return calibratizabilityCapabilitiesResponseSchema.parse(await response.json())
}
