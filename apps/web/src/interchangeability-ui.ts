import {
  interchangeabilityAdminActionResponseSchema,
  interchangeabilityAdminSummaryResponseSchema,
  interchangeabilityCapabilitiesResponseSchema,
  interchangeabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchInterchangeabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/interchangeability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return interchangeabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchInterchangeabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/interchangeability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return interchangeabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeInterchangeabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_interchangeability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/interchangeability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return interchangeabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatInterchangeabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatInterchangeabilityRolloutCheckStatus(
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

export function formatInterchangeabilityAdminAction(action: 'refresh_interchangeability_summary') {
  switch (action) {
    case 'refresh_interchangeability_summary':
      return 'Refresh interchangeability summary'
  }
}

export function formatInterchangeabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_meter_usage_reports' | 'idempotency_keys',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_meter_usage_reports':
      return 'Meter usage reports'
    case 'idempotency_keys':
      return 'Idempotency keys'
  }
}

export async function fetchInterchangeabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/interchangeability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return interchangeabilityCapabilitiesResponseSchema.parse(await response.json())
}
