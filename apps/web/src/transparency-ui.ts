import {
  transparencyAdminActionResponseSchema,
  transparencyAdminSummaryResponseSchema,
  transparencyCapabilitiesResponseSchema,
  transparencyRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTransparencyRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/transparency/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return transparencyRolloutResponseSchema.parse(await response.json())
}

export async function fetchTransparencyAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/transparency/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return transparencyAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTransparencyAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_transparency_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/transparency/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return transparencyAdminActionResponseSchema.parse(await response.json())
}

export function formatTransparencyRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTransparencyRolloutCheckStatus(
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

export function formatTransparencyAdminAction(
  action: 'refresh_transparency_summary',
) {
  switch (action) {
    case 'refresh_transparency_summary':
      return 'Refresh transparency summary'
  }
}

export function formatTransparencyDomain(
  domain:
    | 'completed_runs'
    | 'failed_runs'
    | 'run_workflows'
    | 'billing_notifications',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'run_workflows':
      return 'Run workflows'
    case 'billing_notifications':
      return 'Billing notifications'
  }
}

export async function fetchTransparencyCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/transparency/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return transparencyCapabilitiesResponseSchema.parse(await response.json())
}
