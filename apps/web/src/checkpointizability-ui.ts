import {
  checkpointizabilityAdminActionResponseSchema,
  checkpointizabilityAdminSummaryResponseSchema,
  checkpointizabilityCapabilitiesResponseSchema,
  checkpointizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCheckpointizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/checkpointizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return checkpointizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCheckpointizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/checkpointizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return checkpointizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCheckpointizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_checkpointizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/checkpointizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return checkpointizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCheckpointizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCheckpointizabilityRolloutCheckStatus(
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

export function formatCheckpointizabilityAdminAction(action: 'refresh_checkpointizability_summary') {
  switch (action) {
    case 'refresh_checkpointizability_summary':
      return 'Refresh checkpointizability summary'
  }
}

export function formatCheckpointizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_invoices' | 'billing_records',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_invoices':
      return 'Billing invoices'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchCheckpointizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/checkpointizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return checkpointizabilityCapabilitiesResponseSchema.parse(await response.json())
}
