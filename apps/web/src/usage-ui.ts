import {
  usageAdminActionResponseSchema,
  usageAdminSummaryResponseSchema,
  usageCapabilitiesResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchUsageCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/usage/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return usageCapabilitiesResponseSchema.parse(await response.json())
}

export async function fetchUsageAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/usage/workspace/${encodeURIComponent(workspaceId)}/admin`,
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

  return usageAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeUsageAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  action: 'reset_daily_usage',
) {
  const response = await fetch(
    `${apiBaseUrl}/usage/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceId,
        action,
      }),
    },
  )

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return usageAdminActionResponseSchema.parse(await response.json())
}

export function formatUsageAdminAction(action: 'reset_daily_usage') {
  switch (action) {
    case 'reset_daily_usage':
      return 'Reset daily usage'
  }
}
