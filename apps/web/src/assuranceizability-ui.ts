import {
  assuranceizabilityAdminActionResponseSchema,
  assuranceizabilityAdminSummaryResponseSchema,
  assuranceizabilityCapabilitiesResponseSchema,
  assuranceizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAssuranceizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/assuranceizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return assuranceizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAssuranceizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/assuranceizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return assuranceizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAssuranceizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_assuranceizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/assuranceizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return assuranceizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAssuranceizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAssuranceizabilityRolloutCheckStatus(
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

export function formatAssuranceizabilityAdminAction(action: 'refresh_assuranceizability_summary') {
  switch (action) {
    case 'refresh_assuranceizability_summary':
      return 'Refresh assuranceizability summary'
  }
}

export function formatAssuranceizabilityDomain(
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

export async function fetchAssuranceizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/assuranceizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return assuranceizabilityCapabilitiesResponseSchema.parse(await response.json())
}
