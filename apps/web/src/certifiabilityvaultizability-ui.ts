import {
  certifiabilityvaultizabilityAdminActionResponseSchema,
  certifiabilityvaultizabilityAdminSummaryResponseSchema,
  certifiabilityvaultizabilityCapabilitiesResponseSchema,
  certifiabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCertifiabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/certifiabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return certifiabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCertifiabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/certifiabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return certifiabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCertifiabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_certifiabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/certifiabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return certifiabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCertifiabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCertifiabilityvaultizabilityRolloutCheckStatus(
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

export function formatCertifiabilityvaultizabilityAdminAction(action: 'refresh_certifiabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_certifiabilityvaultizability_summary':
      return 'Refresh certifiabilityvaultizability summary'
  }
}

export function formatCertifiabilityvaultizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'idempotency_keys' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'idempotency_keys':
      return 'Idempotency keys'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchCertifiabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/certifiabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return certifiabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
