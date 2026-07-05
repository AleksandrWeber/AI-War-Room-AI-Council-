import {
  syntacticizabilityAdminActionResponseSchema,
  syntacticizabilityAdminSummaryResponseSchema,
  syntacticizabilityCapabilitiesResponseSchema,
  syntacticizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSyntacticizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/syntacticizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return syntacticizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSyntacticizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/syntacticizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return syntacticizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSyntacticizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_syntacticizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/syntacticizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return syntacticizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSyntacticizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSyntacticizabilityRolloutCheckStatus(
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

export function formatSyntacticizabilityAdminAction(action: 'refresh_syntacticizability_summary') {
  switch (action) {
    case 'refresh_syntacticizability_summary':
      return 'Refresh syntacticizability summary'
  }
}

export function formatSyntacticizabilityDomain(
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

export async function fetchSyntacticizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/syntacticizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return syntacticizabilityCapabilitiesResponseSchema.parse(await response.json())
}
