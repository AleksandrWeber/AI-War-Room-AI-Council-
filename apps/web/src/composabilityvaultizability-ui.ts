import {
  composabilityvaultizabilityAdminActionResponseSchema,
  composabilityvaultizabilityAdminSummaryResponseSchema,
  composabilityvaultizabilityCapabilitiesResponseSchema,
  composabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchComposabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/composabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return composabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchComposabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/composabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return composabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeComposabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_composabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/composabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return composabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatComposabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatComposabilityvaultizabilityRolloutCheckStatus(
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

export function formatComposabilityvaultizabilityAdminAction(action: 'refresh_composabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_composabilityvaultizability_summary':
      return 'Refresh composabilityvaultizability summary'
  }
}

export function formatComposabilityvaultizabilityDomain(
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

export async function fetchComposabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/composabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return composabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
