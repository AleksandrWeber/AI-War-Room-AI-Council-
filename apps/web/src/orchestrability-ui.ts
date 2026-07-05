import {
  orchestrabilityAdminActionResponseSchema,
  orchestrabilityAdminSummaryResponseSchema,
  orchestrabilityCapabilitiesResponseSchema,
  orchestrabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchOrchestrabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/orchestrability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return orchestrabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchOrchestrabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/orchestrability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return orchestrabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeOrchestrabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_orchestrability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/orchestrability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return orchestrabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatOrchestrabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatOrchestrabilityRolloutCheckStatus(
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

export function formatOrchestrabilityAdminAction(action: 'refresh_orchestrability_summary') {
  switch (action) {
    case 'refresh_orchestrability_summary':
      return 'Refresh orchestrability summary'
  }
}

export function formatOrchestrabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'run_workflows' | 'billing_notifications',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'run_workflows':
      return 'Run workflows'
    case 'billing_notifications':
      return 'Billing notifications'
  }
}

export async function fetchOrchestrabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/orchestrability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return orchestrabilityCapabilitiesResponseSchema.parse(await response.json())
}
