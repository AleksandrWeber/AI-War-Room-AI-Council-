import {
  interchangeabilityvaultizabilityAdminActionResponseSchema,
  interchangeabilityvaultizabilityAdminSummaryResponseSchema,
  interchangeabilityvaultizabilityCapabilitiesResponseSchema,
  interchangeabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchInterchangeabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/interchangeabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return interchangeabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchInterchangeabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/interchangeabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return interchangeabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeInterchangeabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_interchangeabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/interchangeabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return interchangeabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatInterchangeabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatInterchangeabilityvaultizabilityRolloutCheckStatus(
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

export function formatInterchangeabilityvaultizabilityAdminAction(action: 'refresh_interchangeabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_interchangeabilityvaultizability_summary':
      return 'Refresh interchangeabilityvaultizability summary'
  }
}

export function formatInterchangeabilityvaultizabilityDomain(
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

export async function fetchInterchangeabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/interchangeabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return interchangeabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
