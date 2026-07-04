import type {
  BillingAdminAction,
  BillingAdminStats,
  BillingAdapter,
  BillingAlert,
  BillingInvoiceRecord,
  BillingMeterUsageReport,
  BillingNotificationRecord,
  BillingRecord,
  BillingWebhookEventRecord,
  WorkspaceRole,
} from '@ai-war-room/schemas'

export function buildBillingAdminStats(input: {
  alerts: BillingAlert[]
  invoices: BillingInvoiceRecord[]
  webhookEvents: BillingWebhookEventRecord[]
  meterUsageReports: BillingMeterUsageReport[]
  notifications: BillingNotificationRecord[]
}): BillingAdminStats {
  return {
    alertCount: input.alerts.length,
    criticalAlertCount: input.alerts.filter(
      (alert) => alert.severity === 'critical',
    ).length,
    invoiceCount: input.invoices.length,
    paidInvoiceTotalUsd: input.invoices
      .filter((invoice) => invoice.status === 'paid')
      .reduce((total, invoice) => total + invoice.amountTotalUsd, 0),
    webhookEventCount: input.webhookEvents.length,
    failedWebhookEventCount: input.webhookEvents.filter(
      (event) => event.status === 'failed',
    ).length,
    meterUsageReportCount: input.meterUsageReports.length,
    failedMeterUsageReportCount: input.meterUsageReports.filter(
      (report) => report.status === 'failed',
    ).length,
    notificationCount: input.notifications.length,
    failedNotificationCount: input.notifications.filter(
      (notification) => notification.status === 'failed',
    ).length,
  }
}

export function resolveBillingAdminActions(input: {
  adapter: BillingAdapter
  billingEnabled: boolean
  billingRecord: BillingRecord | null
}): BillingAdminAction[] {
  if (!input.billingEnabled) {
    return []
  }

  const actions: BillingAdminAction[] = ['sync_notifications']

  if (
    input.adapter === 'mock' &&
    input.billingRecord &&
    (input.billingRecord.paidTier !== 'free' ||
      input.billingRecord.status !== 'draft')
  ) {
    actions.push('reset_mock_billing')
  }

  return actions
}

export function getBillingAdminGuidance(input: {
  role: WorkspaceRole
  billingEnabled: boolean
  availableActions: BillingAdminAction[]
}) {
  if (!input.billingEnabled) {
    return 'Billing admin tools are unavailable while billing is disabled.'
  }

  if (input.availableActions.includes('reset_mock_billing')) {
    return 'Workspace owners and admins can sync billing notifications and reset mock billing state for local testing.'
  }

  return 'Workspace owners and admins can review billing health metrics and sync billing notifications.'
}
