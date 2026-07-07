import {
  attestationizabilityAdminActionResponseSchema,
  attestationizabilityAdminSummaryResponseSchema,
  attestationizabilityCapabilitiesResponseSchema,
  attestationizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAttestationizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/attestationizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return attestationizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAttestationizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/attestationizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return attestationizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAttestationizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_attestationizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/attestationizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return attestationizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAttestationizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAttestationizabilityRolloutCheckStatus(
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

export function formatAttestationizabilityAdminAction(action: 'refresh_attestationizability_summary') {
  switch (action) {
    case 'refresh_attestationizability_summary':
      return 'Refresh attestationizability summary'
  }
}

export function formatAttestationizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_notifications' | 'billing_webhook_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_notifications':
      return 'Billing notifications'
    case 'billing_webhook_events':
      return 'Billing webhook events'
  }
}

export async function fetchAttestationizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/attestationizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return attestationizabilityCapabilitiesResponseSchema.parse(await response.json())
}
