import {
  vocabularizabilityAdminActionResponseSchema,
  vocabularizabilityAdminSummaryResponseSchema,
  vocabularizabilityCapabilitiesResponseSchema,
  vocabularizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchVocabularizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/vocabularizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return vocabularizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchVocabularizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/vocabularizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return vocabularizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeVocabularizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_vocabularizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/vocabularizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return vocabularizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatVocabularizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatVocabularizabilityRolloutCheckStatus(
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

export function formatVocabularizabilityAdminAction(action: 'refresh_vocabularizability_summary') {
  switch (action) {
    case 'refresh_vocabularizability_summary':
      return 'Refresh vocabularizability summary'
  }
}

export function formatVocabularizabilityDomain(
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

export async function fetchVocabularizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/vocabularizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return vocabularizabilityCapabilitiesResponseSchema.parse(await response.json())
}
