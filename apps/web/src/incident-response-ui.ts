import {
  incidentAdminActionResponseSchema,
  incidentAdminSummaryResponseSchema,
  incidentResponseCapabilitiesResponseSchema,
  incidentResponseRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchIncidentResponseRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/incidents/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return incidentResponseRolloutResponseSchema.parse(await response.json())
}

export async function fetchIncidentAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/incidents/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return incidentAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeIncidentAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_incident_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/incidents/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return incidentAdminActionResponseSchema.parse(await response.json())
}

export function formatIncidentResponseRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatIncidentResponseRolloutCheckStatus(
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

export function formatIncidentAdminAction(action: 'refresh_incident_summary') {
  switch (action) {
    case 'refresh_incident_summary':
      return 'Refresh incident summary'
  }
}

export function formatIncidentDomain(
  domain: 'failed_runs' | 'blocked_runs' | 'billing_alerts' | 'shield_incidents',
) {
  switch (domain) {
    case 'failed_runs':
      return 'Failed runs'
    case 'blocked_runs':
      return 'Blocked runs'
    case 'billing_alerts':
      return 'Billing alerts'
    case 'shield_incidents':
      return 'Shield incidents'
  }
}

export async function fetchIncidentResponseCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/incidents/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return incidentResponseCapabilitiesResponseSchema.parse(await response.json())
}
