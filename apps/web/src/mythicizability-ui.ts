import {
  mythicizabilityAdminActionResponseSchema,
  mythicizabilityAdminSummaryResponseSchema,
  mythicizabilityCapabilitiesResponseSchema,
  mythicizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchMythicizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/mythicizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return mythicizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchMythicizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/mythicizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return mythicizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeMythicizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_mythicizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/mythicizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return mythicizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatMythicizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatMythicizabilityRolloutCheckStatus(
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

export function formatMythicizabilityAdminAction(action: 'refresh_mythicizability_summary') {
  switch (action) {
    case 'refresh_mythicizability_summary':
      return 'Refresh mythicizability summary'
  }
}

export function formatMythicizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'artifacts' | 'run_workflows',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'artifacts':
      return 'Artifacts'
    case 'run_workflows':
      return 'Run workflows'
  }
}

export async function fetchMythicizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/mythicizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return mythicizabilityCapabilitiesResponseSchema.parse(await response.json())
}
