import {
  certificationizabilityAdminActionResponseSchema,
  certificationizabilityAdminSummaryResponseSchema,
  certificationizabilityCapabilitiesResponseSchema,
  certificationizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCertificationizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/certificationizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return certificationizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCertificationizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/certificationizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return certificationizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCertificationizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_certificationizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/certificationizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return certificationizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCertificationizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCertificationizabilityRolloutCheckStatus(
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

export function formatCertificationizabilityAdminAction(action: 'refresh_certificationizability_summary') {
  switch (action) {
    case 'refresh_certificationizability_summary':
      return 'Refresh certificationizability summary'
  }
}

export function formatCertificationizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_invoices' | 'billing_records',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_invoices':
      return 'Billing invoices'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchCertificationizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/certificationizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return certificationizabilityCapabilitiesResponseSchema.parse(await response.json())
}
