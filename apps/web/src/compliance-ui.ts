import {
  complianceAdminActionResponseSchema,
  complianceAdminSummaryResponseSchema,
  complianceCapabilitiesResponseSchema,
  complianceRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchComplianceRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/compliance/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return complianceRolloutResponseSchema.parse(await response.json())
}

export async function fetchComplianceAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/compliance/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return complianceAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeComplianceAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_compliance_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/compliance/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return complianceAdminActionResponseSchema.parse(await response.json())
}

export function formatComplianceRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatComplianceRolloutCheckStatus(
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

export function formatComplianceAdminAction(action: 'refresh_compliance_summary') {
  switch (action) {
    case 'refresh_compliance_summary':
      return 'Refresh compliance summary'
  }
}

export function formatComplianceDomain(
  domain:
    | 'shield_reviews'
    | 'provider_credentials'
    | 'billing_records'
    | 'usage_attestation',
) {
  switch (domain) {
    case 'shield_reviews':
      return 'Shield reviews'
    case 'provider_credentials':
      return 'Provider credentials'
    case 'billing_records':
      return 'Billing records'
    case 'usage_attestation':
      return 'Usage attestation'
  }
}

export async function fetchComplianceCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/compliance/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return complianceCapabilitiesResponseSchema.parse(await response.json())
}
