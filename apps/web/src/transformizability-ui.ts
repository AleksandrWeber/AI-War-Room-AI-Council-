import {
  transformizabilityAdminActionResponseSchema,
  transformizabilityAdminSummaryResponseSchema,
  transformizabilityCapabilitiesResponseSchema,
  transformizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTransformizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/transformizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return transformizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchTransformizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/transformizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return transformizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTransformizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_transformizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/transformizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return transformizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatTransformizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTransformizabilityRolloutCheckStatus(
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

export function formatTransformizabilityAdminAction(action: 'refresh_transformizability_summary') {
  switch (action) {
    case 'refresh_transformizability_summary':
      return 'Refresh transformizability summary'
  }
}

export function formatTransformizabilityDomain(
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

export async function fetchTransformizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/transformizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return transformizabilityCapabilitiesResponseSchema.parse(await response.json())
}
