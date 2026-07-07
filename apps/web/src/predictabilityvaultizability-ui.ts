import {
  predictabilityvaultizabilityAdminActionResponseSchema,
  predictabilityvaultizabilityAdminSummaryResponseSchema,
  predictabilityvaultizabilityCapabilitiesResponseSchema,
  predictabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchPredictabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/predictabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return predictabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchPredictabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/predictabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return predictabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executePredictabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_predictabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/predictabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return predictabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatPredictabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatPredictabilityvaultizabilityRolloutCheckStatus(
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

export function formatPredictabilityvaultizabilityAdminAction(action: 'refresh_predictabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_predictabilityvaultizability_summary':
      return 'Refresh predictabilityvaultizability summary'
  }
}

export function formatPredictabilityvaultizabilityDomain(
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

export async function fetchPredictabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/predictabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return predictabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
