import {
  attestationAdminActionResponseSchema,
  attestationAdminSummaryResponseSchema,
  attestationCapabilitiesResponseSchema,
  attestationRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAttestationRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/attestation/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return attestationRolloutResponseSchema.parse(await response.json())
}

export async function fetchAttestationAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/attestation/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return attestationAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAttestationAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_attestation_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/attestation/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return attestationAdminActionResponseSchema.parse(await response.json())
}

export function formatAttestationRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAttestationRolloutCheckStatus(
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

export function formatAttestationAdminAction(action: 'refresh_attestation_summary') {
  switch (action) {
    case 'refresh_attestation_summary':
      return 'Refresh attestation summary'
  }
}

export function formatAttestationDomain(
  domain: 'completed_runs' | 'failed_runs' | 'provider_credentials' | 'model_registry_entries',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'provider_credentials':
      return 'Provider credentials'
    case 'model_registry_entries':
      return 'Model registry entries'
  }
}

export async function fetchAttestationCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/attestation/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return attestationCapabilitiesResponseSchema.parse(await response.json())
}
