import {
  classifiabilityAdminActionResponseSchema,
  classifiabilityAdminSummaryResponseSchema,
  classifiabilityCapabilitiesResponseSchema,
  classifiabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchClassifiabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/classifiability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return classifiabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchClassifiabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/classifiability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return classifiabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeClassifiabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_classifiability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/classifiability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return classifiabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatClassifiabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatClassifiabilityRolloutCheckStatus(
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

export function formatClassifiabilityAdminAction(action: 'refresh_classifiability_summary') {
  switch (action) {
    case 'refresh_classifiability_summary':
      return 'Refresh classifiability summary'
  }
}

export function formatClassifiabilityDomain(
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

export async function fetchClassifiabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/classifiability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return classifiabilityCapabilitiesResponseSchema.parse(await response.json())
}
