import {
  documentizabilityAdminActionResponseSchema,
  documentizabilityAdminSummaryResponseSchema,
  documentizabilityCapabilitiesResponseSchema,
  documentizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDocumentizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/documentizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return documentizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDocumentizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/documentizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return documentizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDocumentizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_documentizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/documentizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return documentizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDocumentizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDocumentizabilityRolloutCheckStatus(
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

export function formatDocumentizabilityAdminAction(action: 'refresh_documentizability_summary') {
  switch (action) {
    case 'refresh_documentizability_summary':
      return 'Refresh documentizability summary'
  }
}

export function formatDocumentizabilityDomain(
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

export async function fetchDocumentizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/documentizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return documentizabilityCapabilitiesResponseSchema.parse(await response.json())
}
