import {
  instrumentationizabilityAdminActionResponseSchema,
  instrumentationizabilityAdminSummaryResponseSchema,
  instrumentationizabilityCapabilitiesResponseSchema,
  instrumentationizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchInstrumentationizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/instrumentationizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return instrumentationizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchInstrumentationizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/instrumentationizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return instrumentationizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeInstrumentationizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_instrumentationizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/instrumentationizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return instrumentationizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatInstrumentationizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatInstrumentationizabilityRolloutCheckStatus(
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

export function formatInstrumentationizabilityAdminAction(action: 'refresh_instrumentationizability_summary') {
  switch (action) {
    case 'refresh_instrumentationizability_summary':
      return 'Refresh instrumentationizability summary'
  }
}

export function formatInstrumentationizabilityDomain(
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

export async function fetchInstrumentationizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/instrumentationizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return instrumentationizabilityCapabilitiesResponseSchema.parse(await response.json())
}
