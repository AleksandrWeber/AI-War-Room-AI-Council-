import {
  trustworthinessvaultizabilityAdminActionResponseSchema,
  trustworthinessvaultizabilityAdminSummaryResponseSchema,
  trustworthinessvaultizabilityCapabilitiesResponseSchema,
  trustworthinessvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTrustworthinessvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/trustworthinessvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return trustworthinessvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchTrustworthinessvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/trustworthinessvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return trustworthinessvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTrustworthinessvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_trustworthinessvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/trustworthinessvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return trustworthinessvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatTrustworthinessvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTrustworthinessvaultizabilityRolloutCheckStatus(
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

export function formatTrustworthinessvaultizabilityAdminAction(action: 'refresh_trustworthinessvaultizability_summary') {
  switch (action) {
    case 'refresh_trustworthinessvaultizability_summary':
      return 'Refresh trustworthinessvaultizability summary'
  }
}

export function formatTrustworthinessvaultizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_notifications' | 'billing_webhook_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_notifications':
      return 'Billing notifications'
    case 'billing_webhook_events':
      return 'Billing webhook events'
  }
}

export async function fetchTrustworthinessvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/trustworthinessvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return trustworthinessvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
