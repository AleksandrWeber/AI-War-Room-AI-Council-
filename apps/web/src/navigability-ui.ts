import {
  navigabilityAdminActionResponseSchema,
  navigabilityAdminSummaryResponseSchema,
  navigabilityCapabilitiesResponseSchema,
  navigabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchNavigabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/navigability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return navigabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchNavigabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/navigability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return navigabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeNavigabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_navigability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/navigability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return navigabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatNavigabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatNavigabilityRolloutCheckStatus(
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

export function formatNavigabilityAdminAction(action: 'refresh_navigability_summary') {
  switch (action) {
    case 'refresh_navigability_summary':
      return 'Refresh navigability summary'
  }
}

export function formatNavigabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'run_workflows' | 'billing_invoices',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'run_workflows':
      return 'Run workflows'
    case 'billing_invoices':
      return 'Billing invoices'
  }
}

export async function fetchNavigabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/navigability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return navigabilityCapabilitiesResponseSchema.parse(await response.json())
}
