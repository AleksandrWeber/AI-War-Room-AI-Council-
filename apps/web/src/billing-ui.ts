import type {
  CheckoutPaidTier,
  MockCustomerPortalResponse,
} from '@ai-war-room/schemas'
import {
  billingAdminActionResponseSchema,
  billingAdminSummaryResponseSchema,
  billingCapabilitiesResponseSchema,
  billingInvoicesResponseSchema,
  billingMeterUsageReportsResponseSchema,
  billingNotificationsResponseSchema,
  billingRolloutResponseSchema,
  billingWorkspaceAlertsResponseSchema,
  billingWorkspaceUsageResponseSchema,
  billingWebhookEventsResponseSchema,
  billingWorkspaceStatusResponseSchema,
  checkoutSessionResponseSchema,
  customerPortalSessionResponseSchema,
  mockCustomerPortalResponseSchema,
} from '@ai-war-room/schemas'
import {
  canOpenCustomerPortal,
  describeBillingCapabilities,
  formatBillingAdminAction,
  formatBillingAlertSeverity,
  formatBillingNotificationStatus,
  formatBillingRolloutCheckStatus,
  formatBillingRolloutStatus,
  formatBillingStatus,
  formatInvoiceAmount,
  formatInvoiceStatus,
  formatMeterUsageReportStatus,
  formatPaidTier,
  formatTierLimits,
  formatUsageCostLabel,
  formatUsageMeterLabel,
  formatUsagePercent,
} from '@ai-war-room/web-blocks'

export const defaultWorkspaceId = 'local_workspace'

export type { BillingReturnHint } from './billing-return.js'
export {
  clearBillingReturnHint,
  readBillingReturnHint,
} from './billing-return.js'

export async function fetchBillingCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/billing/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return billingCapabilitiesResponseSchema.parse(await response.json())
}

export async function fetchBillingRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/billing/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return billingRolloutResponseSchema.parse(await response.json())
}

export async function fetchBillingAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/billing/workspace/${encodeURIComponent(workspaceId)}/admin`,
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

  return billingAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeBillingAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  action: 'sync_notifications' | 'reset_mock_billing',
) {
  const response = await fetch(
    `${apiBaseUrl}/billing/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return billingAdminActionResponseSchema.parse(await response.json())
}

export async function fetchBillingWorkspaceStatus(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/billing/workspace/${encodeURIComponent(workspaceId)}`,
    {
      headers,
    },
  )

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return billingWorkspaceStatusResponseSchema.parse(await response.json())
}

export async function fetchBillingInvoices(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/billing/workspace/${encodeURIComponent(workspaceId)}/invoices`,
    {
      headers,
    },
  )

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return billingInvoicesResponseSchema.parse(await response.json())
}

export async function fetchBillingUsageSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/billing/workspace/${encodeURIComponent(workspaceId)}/usage`,
    {
      headers,
    },
  )

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return billingWorkspaceUsageResponseSchema.parse(await response.json())
}

export async function fetchBillingAlerts(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/billing/workspace/${encodeURIComponent(workspaceId)}/alerts`,
    {
      headers,
    },
  )

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return billingWorkspaceAlertsResponseSchema.parse(await response.json())
}

export async function fetchBillingMeterUsageReports(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/billing/workspace/${encodeURIComponent(workspaceId)}/meter-usage-reports`,
    {
      headers,
    },
  )

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return billingMeterUsageReportsResponseSchema.parse(await response.json())
}

export async function fetchBillingNotifications(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/billing/workspace/${encodeURIComponent(workspaceId)}/notifications`,
    {
      headers,
    },
  )

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return billingNotificationsResponseSchema.parse(await response.json())
}

function readContentDispositionFilename(contentDisposition: string | null) {
  if (!contentDisposition) {
    return null
  }

  const match = contentDisposition.match(/filename="([^"]+)"/)

  return match?.[1] ?? null
}

export async function downloadBillingInvoiceExport(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  format: 'csv' | 'json',
) {
  const response = await fetch(
    `${apiBaseUrl}/billing/workspace/${encodeURIComponent(workspaceId)}/invoices/export?format=${format}`,
    {
      headers,
    },
  )

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  const blob = await response.blob()
  const filename =
    readContentDispositionFilename(response.headers.get('content-disposition')) ??
    `${workspaceId}-invoices.${format}`
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export async function fetchBillingWebhookEvents(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/billing/workspace/${encodeURIComponent(workspaceId)}/webhook-events`,
    {
      headers,
    },
  )

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return billingWebhookEventsResponseSchema.parse(await response.json())
}

export async function createBillingCheckoutSession(
  apiBaseUrl: string,
  workspaceId: string,
  paidTier: CheckoutPaidTier,
  headers: Record<string, string>,
) {
  const response = await fetch(`${apiBaseUrl}/billing/checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      workspaceId,
      paidTier,
    }),
  })

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return checkoutSessionResponseSchema.parse(await response.json())
}

export async function createCustomerPortalSession(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(`${apiBaseUrl}/billing/customer-portal-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      workspaceId,
    }),
  })

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return customerPortalSessionResponseSchema.parse(await response.json())
}

export async function fetchMockCustomerPortal(portalUrl: string) {
  const response = await fetch(portalUrl)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return mockCustomerPortalResponseSchema.parse(await response.json())
}

export async function cancelMockCustomerPortalSubscription(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(`${apiBaseUrl}/billing/mock/portal/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      workspaceId,
    }),
  })

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return billingWorkspaceStatusResponseSchema.parse(await response.json())
}

export async function completeMockBillingCheckout(checkoutUrl: string) {
  const response = await fetch(checkoutUrl)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return billingWorkspaceStatusResponseSchema.parse(await response.json())
}

export {
  canOpenCustomerPortal,
  describeBillingCapabilities,
  formatBillingAdminAction,
  formatBillingAlertSeverity,
  formatBillingNotificationStatus,
  formatBillingRolloutCheckStatus,
  formatBillingRolloutStatus,
  formatBillingStatus,
  formatInvoiceAmount,
  formatInvoiceStatus,
  formatMeterUsageReportStatus,
  formatPaidTier,
  formatTierLimits,
  formatUsageCostLabel,
  formatUsageMeterLabel,
  formatUsagePercent,
}

export type { MockCustomerPortalResponse }
