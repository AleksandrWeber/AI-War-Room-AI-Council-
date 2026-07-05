import {
  interpretabilityAdminActionResponseSchema,
  interpretabilityAdminSummaryResponseSchema,
  interpretabilityCapabilitiesResponseSchema,
  interpretabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchInterpretabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/interpretability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return interpretabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchInterpretabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/interpretability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return interpretabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeInterpretabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_interpretability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/interpretability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return interpretabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatInterpretabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatInterpretabilityRolloutCheckStatus(
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

export function formatInterpretabilityAdminAction(action: 'refresh_interpretability_summary') {
  switch (action) {
    case 'refresh_interpretability_summary':
      return 'Refresh interpretability summary'
  }
}

export function formatInterpretabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'agent_outputs' | 'moderator_syntheses',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'agent_outputs':
      return 'Agent outputs'
    case 'moderator_syntheses':
      return 'Moderator syntheses'
  }
}

export async function fetchInterpretabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/interpretability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return interpretabilityCapabilitiesResponseSchema.parse(await response.json())
}
