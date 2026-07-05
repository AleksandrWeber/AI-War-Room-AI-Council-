import {
  referencabilityAdminActionResponseSchema,
  referencabilityAdminSummaryResponseSchema,
  referencabilityCapabilitiesResponseSchema,
  referencabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchReferencabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/referencability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return referencabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchReferencabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/referencability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return referencabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeReferencabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_referencability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/referencability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return referencabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatReferencabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatReferencabilityRolloutCheckStatus(
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

export function formatReferencabilityAdminAction(action: 'refresh_referencability_summary') {
  switch (action) {
    case 'refresh_referencability_summary':
      return 'Refresh referencability summary'
  }
}

export function formatReferencabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'artifacts' | 'billing_records',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'artifacts':
      return 'Artifacts'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchReferencabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/referencability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return referencabilityCapabilitiesResponseSchema.parse(await response.json())
}
