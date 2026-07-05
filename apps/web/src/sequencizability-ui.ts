import {
  sequencizabilityAdminActionResponseSchema,
  sequencizabilityAdminSummaryResponseSchema,
  sequencizabilityCapabilitiesResponseSchema,
  sequencizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSequencizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/sequencizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return sequencizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSequencizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/sequencizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return sequencizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSequencizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_sequencizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/sequencizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return sequencizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSequencizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSequencizabilityRolloutCheckStatus(
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

export function formatSequencizabilityAdminAction(action: 'refresh_sequencizability_summary') {
  switch (action) {
    case 'refresh_sequencizability_summary':
      return 'Refresh sequencizability summary'
  }
}

export function formatSequencizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'model_health_events' | 'billing_records',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'model_health_events':
      return 'Model health events'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchSequencizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/sequencizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return sequencizabilityCapabilitiesResponseSchema.parse(await response.json())
}
