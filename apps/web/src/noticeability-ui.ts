import {
  noticeabilityAdminActionResponseSchema,
  noticeabilityAdminSummaryResponseSchema,
  noticeabilityCapabilitiesResponseSchema,
  noticeabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchNoticeabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/noticeability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return noticeabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchNoticeabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/noticeability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return noticeabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeNoticeabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_noticeability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/noticeability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return noticeabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatNoticeabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatNoticeabilityRolloutCheckStatus(
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

export function formatNoticeabilityAdminAction(action: 'refresh_noticeability_summary') {
  switch (action) {
    case 'refresh_noticeability_summary':
      return 'Refresh noticeability summary'
  }
}

export function formatNoticeabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_notifications' | 'billing_webhook_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_notifications':
      return 'Billing notifications'
    case 'billing_webhook_events':
      return 'Billing webhook events'
  }
}

export async function fetchNoticeabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/noticeability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return noticeabilityCapabilitiesResponseSchema.parse(await response.json())
}
