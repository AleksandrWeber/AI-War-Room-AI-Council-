import {
  disclosureproofizabilityAdminActionResponseSchema,
  disclosureproofizabilityAdminSummaryResponseSchema,
  disclosureproofizabilityCapabilitiesResponseSchema,
  disclosureproofizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDisclosureproofizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/disclosureproofizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return disclosureproofizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDisclosureproofizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/disclosureproofizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return disclosureproofizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDisclosureproofizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_disclosureproofizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/disclosureproofizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return disclosureproofizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDisclosureproofizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDisclosureproofizabilityRolloutCheckStatus(
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

export function formatDisclosureproofizabilityAdminAction(action: 'refresh_disclosureproofizability_summary') {
  switch (action) {
    case 'refresh_disclosureproofizability_summary':
      return 'Refresh disclosureproofizability summary'
  }
}

export function formatDisclosureproofizabilityDomain(
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

export async function fetchDisclosureproofizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/disclosureproofizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return disclosureproofizabilityCapabilitiesResponseSchema.parse(await response.json())
}
