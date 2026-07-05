import {
  thesaurusizabilityAdminActionResponseSchema,
  thesaurusizabilityAdminSummaryResponseSchema,
  thesaurusizabilityCapabilitiesResponseSchema,
  thesaurusizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchThesaurusizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/thesaurusizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return thesaurusizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchThesaurusizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/thesaurusizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return thesaurusizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeThesaurusizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_thesaurusizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/thesaurusizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return thesaurusizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatThesaurusizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatThesaurusizabilityRolloutCheckStatus(
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

export function formatThesaurusizabilityAdminAction(action: 'refresh_thesaurusizability_summary') {
  switch (action) {
    case 'refresh_thesaurusizability_summary':
      return 'Refresh thesaurusizability summary'
  }
}

export function formatThesaurusizabilityDomain(
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

export async function fetchThesaurusizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/thesaurusizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return thesaurusizabilityCapabilitiesResponseSchema.parse(await response.json())
}
