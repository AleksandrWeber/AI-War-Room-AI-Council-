import {
  manageabilityvaultizabilityAdminActionResponseSchema,
  manageabilityvaultizabilityAdminSummaryResponseSchema,
  manageabilityvaultizabilityCapabilitiesResponseSchema,
  manageabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchManageabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/manageabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return manageabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchManageabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/manageabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return manageabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeManageabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_manageabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/manageabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return manageabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatManageabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatManageabilityvaultizabilityRolloutCheckStatus(
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

export function formatManageabilityvaultizabilityAdminAction(action: 'refresh_manageabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_manageabilityvaultizability_summary':
      return 'Refresh manageabilityvaultizability summary'
  }
}

export function formatManageabilityvaultizabilityDomain(
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

export async function fetchManageabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/manageabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return manageabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
