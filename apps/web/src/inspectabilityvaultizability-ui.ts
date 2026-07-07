import {
  inspectabilityvaultizabilityAdminActionResponseSchema,
  inspectabilityvaultizabilityAdminSummaryResponseSchema,
  inspectabilityvaultizabilityCapabilitiesResponseSchema,
  inspectabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchInspectabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/inspectabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return inspectabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchInspectabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/inspectabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return inspectabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeInspectabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_inspectabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/inspectabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return inspectabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatInspectabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatInspectabilityvaultizabilityRolloutCheckStatus(
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

export function formatInspectabilityvaultizabilityAdminAction(action: 'refresh_inspectabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_inspectabilityvaultizability_summary':
      return 'Refresh inspectabilityvaultizability summary'
  }
}

export function formatInspectabilityvaultizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'idempotency_keys' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'idempotency_keys':
      return 'Idempotency keys'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchInspectabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/inspectabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return inspectabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
