import {
  scriptabilizabilityAdminActionResponseSchema,
  scriptabilizabilityAdminSummaryResponseSchema,
  scriptabilizabilityCapabilitiesResponseSchema,
  scriptabilizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchScriptabilizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/scriptabilizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return scriptabilizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchScriptabilizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/scriptabilizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return scriptabilizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeScriptabilizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_scriptabilizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/scriptabilizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return scriptabilizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatScriptabilizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatScriptabilizabilityRolloutCheckStatus(
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

export function formatScriptabilizabilityAdminAction(action: 'refresh_scriptabilizability_summary') {
  switch (action) {
    case 'refresh_scriptabilizability_summary':
      return 'Refresh scriptabilizability summary'
  }
}

export function formatScriptabilizabilityDomain(
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

export async function fetchScriptabilizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/scriptabilizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return scriptabilizabilityCapabilitiesResponseSchema.parse(await response.json())
}
