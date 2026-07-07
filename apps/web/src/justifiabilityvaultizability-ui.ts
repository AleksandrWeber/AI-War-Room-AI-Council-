import {
  justifiabilityvaultizabilityAdminActionResponseSchema,
  justifiabilityvaultizabilityAdminSummaryResponseSchema,
  justifiabilityvaultizabilityCapabilitiesResponseSchema,
  justifiabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchJustifiabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/justifiabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return justifiabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchJustifiabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/justifiabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return justifiabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeJustifiabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_justifiabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/justifiabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return justifiabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatJustifiabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatJustifiabilityvaultizabilityRolloutCheckStatus(
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

export function formatJustifiabilityvaultizabilityAdminAction(action: 'refresh_justifiabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_justifiabilityvaultizability_summary':
      return 'Refresh justifiabilityvaultizability summary'
  }
}

export function formatJustifiabilityvaultizabilityDomain(
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

export async function fetchJustifiabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/justifiabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return justifiabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
