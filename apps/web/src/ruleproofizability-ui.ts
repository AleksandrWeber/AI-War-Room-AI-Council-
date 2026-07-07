import {
  ruleproofizabilityAdminActionResponseSchema,
  ruleproofizabilityAdminSummaryResponseSchema,
  ruleproofizabilityCapabilitiesResponseSchema,
  ruleproofizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRuleproofizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/ruleproofizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return ruleproofizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRuleproofizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/ruleproofizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return ruleproofizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRuleproofizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_ruleproofizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/ruleproofizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return ruleproofizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRuleproofizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRuleproofizabilityRolloutCheckStatus(
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

export function formatRuleproofizabilityAdminAction(action: 'refresh_ruleproofizability_summary') {
  switch (action) {
    case 'refresh_ruleproofizability_summary':
      return 'Refresh ruleproofizability summary'
  }
}

export function formatRuleproofizabilityDomain(
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

export async function fetchRuleproofizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/ruleproofizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return ruleproofizabilityCapabilitiesResponseSchema.parse(await response.json())
}
