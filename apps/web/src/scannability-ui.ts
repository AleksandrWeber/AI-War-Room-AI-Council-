import {
  scannabilityAdminActionResponseSchema,
  scannabilityAdminSummaryResponseSchema,
  scannabilityCapabilitiesResponseSchema,
  scannabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchScannabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/scannability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return scannabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchScannabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/scannability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return scannabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeScannabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_scannability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/scannability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return scannabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatScannabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatScannabilityRolloutCheckStatus(
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

export function formatScannabilityAdminAction(action: 'refresh_scannability_summary') {
  switch (action) {
    case 'refresh_scannability_summary':
      return 'Refresh scannability summary'
  }
}

export function formatScannabilityDomain(
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

export async function fetchScannabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/scannability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return scannabilityCapabilitiesResponseSchema.parse(await response.json())
}
