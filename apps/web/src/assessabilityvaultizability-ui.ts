import {
  assessabilityvaultizabilityAdminActionResponseSchema,
  assessabilityvaultizabilityAdminSummaryResponseSchema,
  assessabilityvaultizabilityCapabilitiesResponseSchema,
  assessabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAssessabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/assessabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return assessabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAssessabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/assessabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return assessabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAssessabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_assessabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/assessabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return assessabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAssessabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAssessabilityvaultizabilityRolloutCheckStatus(
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

export function formatAssessabilityvaultizabilityAdminAction(action: 'refresh_assessabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_assessabilityvaultizability_summary':
      return 'Refresh assessabilityvaultizability summary'
  }
}

export function formatAssessabilityvaultizabilityDomain(
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

export async function fetchAssessabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/assessabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return assessabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
