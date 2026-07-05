import {
  contextualizabilityAdminActionResponseSchema,
  contextualizabilityAdminSummaryResponseSchema,
  contextualizabilityCapabilitiesResponseSchema,
  contextualizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchContextualizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/contextualizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return contextualizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchContextualizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/contextualizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return contextualizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeContextualizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_contextualizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/contextualizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return contextualizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatContextualizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatContextualizabilityRolloutCheckStatus(
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

export function formatContextualizabilityAdminAction(action: 'refresh_contextualizability_summary') {
  switch (action) {
    case 'refresh_contextualizability_summary':
      return 'Refresh contextualizability summary'
  }
}

export function formatContextualizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_webhook_events' | 'billing_records',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_webhook_events':
      return 'Billing webhook events'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchContextualizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/contextualizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return contextualizabilityCapabilitiesResponseSchema.parse(await response.json())
}
