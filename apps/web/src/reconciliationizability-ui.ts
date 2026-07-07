import {
  reconciliationizabilityAdminActionResponseSchema,
  reconciliationizabilityAdminSummaryResponseSchema,
  reconciliationizabilityCapabilitiesResponseSchema,
  reconciliationizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchReconciliationizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/reconciliationizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return reconciliationizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchReconciliationizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/reconciliationizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return reconciliationizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeReconciliationizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_reconciliationizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/reconciliationizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return reconciliationizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatReconciliationizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatReconciliationizabilityRolloutCheckStatus(
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

export function formatReconciliationizabilityAdminAction(action: 'refresh_reconciliationizability_summary') {
  switch (action) {
    case 'refresh_reconciliationizability_summary':
      return 'Refresh reconciliationizability summary'
  }
}

export function formatReconciliationizabilityDomain(
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

export async function fetchReconciliationizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/reconciliationizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return reconciliationizabilityCapabilitiesResponseSchema.parse(await response.json())
}
