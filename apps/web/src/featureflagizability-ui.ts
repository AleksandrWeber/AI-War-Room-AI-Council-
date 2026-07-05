import {
  featureflagizabilityAdminActionResponseSchema,
  featureflagizabilityAdminSummaryResponseSchema,
  featureflagizabilityCapabilitiesResponseSchema,
  featureflagizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchFeatureflagizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/featureflagizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return featureflagizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchFeatureflagizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/featureflagizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return featureflagizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeFeatureflagizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_featureflagizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/featureflagizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return featureflagizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatFeatureflagizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatFeatureflagizabilityRolloutCheckStatus(
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

export function formatFeatureflagizabilityAdminAction(action: 'refresh_featureflagizability_summary') {
  switch (action) {
    case 'refresh_featureflagizability_summary':
      return 'Refresh featureflagizability summary'
  }
}

export function formatFeatureflagizabilityDomain(
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

export async function fetchFeatureflagizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/featureflagizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return featureflagizabilityCapabilitiesResponseSchema.parse(await response.json())
}
