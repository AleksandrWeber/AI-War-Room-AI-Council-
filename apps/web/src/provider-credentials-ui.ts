import {
  providerCredentialsCapabilitiesResponseSchema,
  providerCredentialsRolloutResponseSchema,
  providerKeyAdminActionResponseSchema,
  providerKeyAdminSummaryResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchProviderCredentialsRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/provider-credentials/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return providerCredentialsRolloutResponseSchema.parse(await response.json())
}

export async function fetchProviderKeyAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/provider-credentials/workspace/${encodeURIComponent(workspaceId)}/admin`,
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

  return providerKeyAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeProviderKeyAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: {
    action: 'test_all_credentials' | 'retest_failed_credentials'
  },
) {
  const response = await fetch(
    `${apiBaseUrl}/provider-credentials/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return providerKeyAdminActionResponseSchema.parse(await response.json())
}

export function formatProviderCredentialsRolloutStatus(
  status: 'ready' | 'not_ready',
) {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatProviderCredentialsRolloutCheckStatus(
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

export function formatProviderKeyTestStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function formatProviderKeyAdminAction(
  action: 'test_all_credentials' | 'retest_failed_credentials',
) {
  switch (action) {
    case 'test_all_credentials':
      return 'Test all credentials'
    case 'retest_failed_credentials':
      return 'Retest failed credentials'
  }
}

export async function fetchProviderCredentialsCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/provider-credentials/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return providerCredentialsCapabilitiesResponseSchema.parse(await response.json())
}
