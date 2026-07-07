import {
  signatureproofizabilityAdminActionResponseSchema,
  signatureproofizabilityAdminSummaryResponseSchema,
  signatureproofizabilityCapabilitiesResponseSchema,
  signatureproofizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSignatureproofizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/signatureproofizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return signatureproofizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSignatureproofizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/signatureproofizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return signatureproofizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSignatureproofizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_signatureproofizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/signatureproofizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return signatureproofizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSignatureproofizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSignatureproofizabilityRolloutCheckStatus(
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

export function formatSignatureproofizabilityAdminAction(action: 'refresh_signatureproofizability_summary') {
  switch (action) {
    case 'refresh_signatureproofizability_summary':
      return 'Refresh signatureproofizability summary'
  }
}

export function formatSignatureproofizabilityDomain(
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

export async function fetchSignatureproofizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/signatureproofizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return signatureproofizabilityCapabilitiesResponseSchema.parse(await response.json())
}
