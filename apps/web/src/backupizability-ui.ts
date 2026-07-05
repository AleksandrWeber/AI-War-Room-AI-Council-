import {
  backupizabilityAdminActionResponseSchema,
  backupizabilityAdminSummaryResponseSchema,
  backupizabilityCapabilitiesResponseSchema,
  backupizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchBackupizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/backupizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return backupizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchBackupizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/backupizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return backupizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeBackupizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_backupizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/backupizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return backupizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatBackupizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatBackupizabilityRolloutCheckStatus(
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

export function formatBackupizabilityAdminAction(action: 'refresh_backupizability_summary') {
  switch (action) {
    case 'refresh_backupizability_summary':
      return 'Refresh backupizability summary'
  }
}

export function formatBackupizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_meter_usage_reports' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_meter_usage_reports':
      return 'Meter usage reports'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchBackupizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/backupizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return backupizabilityCapabilitiesResponseSchema.parse(await response.json())
}
