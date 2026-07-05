import {
  lexicalizabilityAdminActionResponseSchema,
  lexicalizabilityAdminSummaryResponseSchema,
  lexicalizabilityCapabilitiesResponseSchema,
  lexicalizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchLexicalizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/lexicalizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return lexicalizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchLexicalizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/lexicalizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return lexicalizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeLexicalizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_lexicalizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/lexicalizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return lexicalizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatLexicalizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatLexicalizabilityRolloutCheckStatus(
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

export function formatLexicalizabilityAdminAction(action: 'refresh_lexicalizability_summary') {
  switch (action) {
    case 'refresh_lexicalizability_summary':
      return 'Refresh lexicalizability summary'
  }
}

export function formatLexicalizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_memberships' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_memberships':
      return 'Workspace memberships'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchLexicalizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/lexicalizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return lexicalizabilityCapabilitiesResponseSchema.parse(await response.json())
}
