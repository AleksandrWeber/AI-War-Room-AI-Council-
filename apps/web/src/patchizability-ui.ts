import {
  patchizabilityAdminActionResponseSchema,
  patchizabilityAdminSummaryResponseSchema,
  patchizabilityCapabilitiesResponseSchema,
  patchizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchPatchizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/patchizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return patchizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchPatchizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/patchizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return patchizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executePatchizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_patchizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/patchizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return patchizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatPatchizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatPatchizabilityRolloutCheckStatus(
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

export function formatPatchizabilityAdminAction(action: 'refresh_patchizability_summary') {
  switch (action) {
    case 'refresh_patchizability_summary':
      return 'Refresh patchizability summary'
  }
}

export function formatPatchizabilityDomain(
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

export async function fetchPatchizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/patchizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return patchizabilityCapabilitiesResponseSchema.parse(await response.json())
}
