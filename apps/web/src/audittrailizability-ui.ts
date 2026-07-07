import {
  audittrailizabilityAdminActionResponseSchema,
  audittrailizabilityAdminSummaryResponseSchema,
  audittrailizabilityCapabilitiesResponseSchema,
  audittrailizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAudittrailizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/audittrailizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return audittrailizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAudittrailizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/audittrailizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return audittrailizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAudittrailizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_audittrailizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/audittrailizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return audittrailizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAudittrailizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAudittrailizabilityRolloutCheckStatus(
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

export function formatAudittrailizabilityAdminAction(action: 'refresh_audittrailizability_summary') {
  switch (action) {
    case 'refresh_audittrailizability_summary':
      return 'Refresh audittrailizability summary'
  }
}

export function formatAudittrailizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'shield_scans' | 'workspace_provider_credentials',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'shield_scans':
      return 'Shield scans'
    case 'workspace_provider_credentials':
      return 'Provider credentials'
  }
}

export async function fetchAudittrailizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/audittrailizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return audittrailizabilityCapabilitiesResponseSchema.parse(await response.json())
}
