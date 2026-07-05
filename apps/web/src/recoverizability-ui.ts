import {
  recoverizabilityAdminActionResponseSchema,
  recoverizabilityAdminSummaryResponseSchema,
  recoverizabilityCapabilitiesResponseSchema,
  recoverizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRecoverizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/recoverizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return recoverizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRecoverizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/recoverizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return recoverizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRecoverizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_recoverizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/recoverizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return recoverizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRecoverizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRecoverizabilityRolloutCheckStatus(
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

export function formatRecoverizabilityAdminAction(action: 'refresh_recoverizability_summary') {
  switch (action) {
    case 'refresh_recoverizability_summary':
      return 'Refresh recoverizability summary'
  }
}

export function formatRecoverizabilityDomain(
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

export async function fetchRecoverizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/recoverizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return recoverizabilityCapabilitiesResponseSchema.parse(await response.json())
}
