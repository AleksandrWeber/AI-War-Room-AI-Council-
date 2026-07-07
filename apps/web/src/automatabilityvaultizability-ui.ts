import {
  automatabilityvaultizabilityAdminActionResponseSchema,
  automatabilityvaultizabilityAdminSummaryResponseSchema,
  automatabilityvaultizabilityCapabilitiesResponseSchema,
  automatabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAutomatabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/automatabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return automatabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAutomatabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/automatabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return automatabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAutomatabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_automatabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/automatabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return automatabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAutomatabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAutomatabilityvaultizabilityRolloutCheckStatus(
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

export function formatAutomatabilityvaultizabilityAdminAction(action: 'refresh_automatabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_automatabilityvaultizability_summary':
      return 'Refresh automatabilityvaultizability summary'
  }
}

export function formatAutomatabilityvaultizabilityDomain(
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

export async function fetchAutomatabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/automatabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return automatabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
