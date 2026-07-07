import {
  remediationizabilityAdminActionResponseSchema,
  remediationizabilityAdminSummaryResponseSchema,
  remediationizabilityCapabilitiesResponseSchema,
  remediationizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRemediationizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/remediationizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return remediationizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRemediationizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/remediationizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return remediationizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRemediationizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_remediationizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/remediationizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return remediationizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRemediationizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRemediationizabilityRolloutCheckStatus(
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

export function formatRemediationizabilityAdminAction(action: 'refresh_remediationizability_summary') {
  switch (action) {
    case 'refresh_remediationizability_summary':
      return 'Refresh remediationizability summary'
  }
}

export function formatRemediationizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'idempotency_keys' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'idempotency_keys':
      return 'Idempotency keys'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchRemediationizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/remediationizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return remediationizabilityCapabilitiesResponseSchema.parse(await response.json())
}
