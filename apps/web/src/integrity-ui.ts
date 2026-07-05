import {
  integrityAdminActionResponseSchema,
  integrityAdminSummaryResponseSchema,
  integrityCapabilitiesResponseSchema,
  integrityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchIntegrityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/integrity/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return integrityRolloutResponseSchema.parse(await response.json())
}

export async function fetchIntegrityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/integrity/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return integrityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeIntegrityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_integrity_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/integrity/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return integrityAdminActionResponseSchema.parse(await response.json())
}

export function formatIntegrityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatIntegrityRolloutCheckStatus(
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

export function formatIntegrityAdminAction(action: 'refresh_integrity_summary') {
  switch (action) {
    case 'refresh_integrity_summary':
      return 'Refresh integrity summary'
  }
}

export function formatIntegrityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'artifacts' | 'shield_scans',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'artifacts':
      return 'Artifacts'
    case 'shield_scans':
      return 'Shield scans'
  }
}

export async function fetchIntegrityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/integrity/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return integrityCapabilitiesResponseSchema.parse(await response.json())
}
