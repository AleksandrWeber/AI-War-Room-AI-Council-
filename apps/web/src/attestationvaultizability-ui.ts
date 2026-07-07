import {
  attestationvaultizabilityAdminActionResponseSchema,
  attestationvaultizabilityAdminSummaryResponseSchema,
  attestationvaultizabilityCapabilitiesResponseSchema,
  attestationvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAttestationvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/attestationvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return attestationvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAttestationvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/attestationvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return attestationvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAttestationvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_attestationvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/attestationvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return attestationvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAttestationvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAttestationvaultizabilityRolloutCheckStatus(
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

export function formatAttestationvaultizabilityAdminAction(action: 'refresh_attestationvaultizability_summary') {
  switch (action) {
    case 'refresh_attestationvaultizability_summary':
      return 'Refresh attestationvaultizability summary'
  }
}

export function formatAttestationvaultizabilityDomain(
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

export async function fetchAttestationvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/attestationvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return attestationvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
