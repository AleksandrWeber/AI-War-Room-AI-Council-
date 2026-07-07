import {
  repeatabilityvaultizabilityAdminActionResponseSchema,
  repeatabilityvaultizabilityAdminSummaryResponseSchema,
  repeatabilityvaultizabilityCapabilitiesResponseSchema,
  repeatabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRepeatabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/repeatabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return repeatabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRepeatabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/repeatabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return repeatabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRepeatabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_repeatabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/repeatabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return repeatabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRepeatabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRepeatabilityvaultizabilityRolloutCheckStatus(
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

export function formatRepeatabilityvaultizabilityAdminAction(action: 'refresh_repeatabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_repeatabilityvaultizability_summary':
      return 'Refresh repeatabilityvaultizability summary'
  }
}

export function formatRepeatabilityvaultizabilityDomain(
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

export async function fetchRepeatabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/repeatabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return repeatabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
