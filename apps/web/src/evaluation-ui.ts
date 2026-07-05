import {
  promptEvaluationCapabilitiesResponseSchema,
  promptEvaluationRolloutResponseSchema,
  promptRegressionAdminActionResponseSchema,
  promptRegressionAdminSummaryResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchPromptEvaluationRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/evaluation/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return promptEvaluationRolloutResponseSchema.parse(await response.json())
}

export async function fetchPromptRegressionAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/evaluation/workspace/${encodeURIComponent(workspaceId)}/admin`,
    {
      headers,
    },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return promptRegressionAdminSummaryResponseSchema.parse(await response.json())
}

export async function executePromptRegressionAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: {
    action: 'rerun_prompt_regression'
  },
) {
  const response = await fetch(
    `${apiBaseUrl}/evaluation/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return promptRegressionAdminActionResponseSchema.parse(await response.json())
}

export function formatPromptEvaluationRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatPromptEvaluationRolloutCheckStatus(
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

export function formatPromptRegressionAdminAction(action: 'rerun_prompt_regression') {
  switch (action) {
    case 'rerun_prompt_regression':
      return 'Rerun prompt regression'
  }
}

export function formatPromptRegressionScore(score: number) {
  return `${Math.round(score * 100)}%`
}

export async function fetchPromptEvaluationCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/evaluation/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return promptEvaluationCapabilitiesResponseSchema.parse(await response.json())
}
