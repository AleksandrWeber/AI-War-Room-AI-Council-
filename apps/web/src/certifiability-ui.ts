import {
  certifiabilityAdminActionResponseSchema,
  certifiabilityAdminSummaryResponseSchema,
  certifiabilityCapabilitiesResponseSchema,
  certifiabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCertifiabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/certifiability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return certifiabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCertifiabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/certifiability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return certifiabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCertifiabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_certifiability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/certifiability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return certifiabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCertifiabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCertifiabilityRolloutCheckStatus(
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

export function formatCertifiabilityAdminAction(action: 'refresh_certifiability_summary') {
  switch (action) {
    case 'refresh_certifiability_summary':
      return 'Refresh certifiability summary'
  }
}

export function formatCertifiabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_provider_credentials' | 'billing_webhook_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_provider_credentials':
      return 'Provider credentials'
    case 'billing_webhook_events':
      return 'Billing webhook events'
  }
}

export async function fetchCertifiabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/certifiability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return certifiabilityCapabilitiesResponseSchema.parse(await response.json())
}
