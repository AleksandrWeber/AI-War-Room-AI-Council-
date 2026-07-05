import {
  predictabilityAdminActionResponseSchema,
  predictabilityAdminSummaryResponseSchema,
  predictabilityCapabilitiesResponseSchema,
  predictabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchPredictabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/predictability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return predictabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchPredictabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/predictability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return predictabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executePredictabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_predictability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/predictability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return predictabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatPredictabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatPredictabilityRolloutCheckStatus(
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

export function formatPredictabilityAdminAction(action: 'refresh_predictability_summary') {
  switch (action) {
    case 'refresh_predictability_summary':
      return 'Refresh predictability summary'
  }
}

export function formatPredictabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'moderator_syntheses' | 'billing_invoices',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'moderator_syntheses':
      return 'Moderator syntheses'
    case 'billing_invoices':
      return 'Billing invoices'
  }
}

export async function fetchPredictabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/predictability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return predictabilityCapabilitiesResponseSchema.parse(await response.json())
}
