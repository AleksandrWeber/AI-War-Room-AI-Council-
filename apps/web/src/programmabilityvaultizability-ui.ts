import {
  programmabilityvaultizabilityAdminActionResponseSchema,
  programmabilityvaultizabilityAdminSummaryResponseSchema,
  programmabilityvaultizabilityCapabilitiesResponseSchema,
  programmabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchProgrammabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/programmabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return programmabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchProgrammabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/programmabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return programmabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeProgrammabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_programmabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/programmabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return programmabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatProgrammabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatProgrammabilityvaultizabilityRolloutCheckStatus(
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

export function formatProgrammabilityvaultizabilityAdminAction(action: 'refresh_programmabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_programmabilityvaultizability_summary':
      return 'Refresh programmabilityvaultizability summary'
  }
}

export function formatProgrammabilityvaultizabilityDomain(
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

export async function fetchProgrammabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/programmabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return programmabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
