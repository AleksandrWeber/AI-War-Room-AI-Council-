import {
  recognizabilityAdminActionResponseSchema,
  recognizabilityAdminSummaryResponseSchema,
  recognizabilityCapabilitiesResponseSchema,
  recognizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRecognizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/recognizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return recognizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRecognizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/recognizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return recognizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRecognizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_recognizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/recognizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return recognizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRecognizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRecognizabilityRolloutCheckStatus(
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

export function formatRecognizabilityAdminAction(action: 'refresh_recognizability_summary') {
  switch (action) {
    case 'refresh_recognizability_summary':
      return 'Refresh recognizability summary'
  }
}

export function formatRecognizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'artifacts' | 'run_workflows',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'artifacts':
      return 'Artifacts'
    case 'run_workflows':
      return 'Run workflows'
  }
}

export async function fetchRecognizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/recognizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return recognizabilityCapabilitiesResponseSchema.parse(await response.json())
}
