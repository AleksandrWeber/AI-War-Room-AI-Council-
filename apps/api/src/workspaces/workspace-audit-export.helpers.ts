import type {
  BillingMeterUsageReport,
  BillingNotificationRecord,
  BillingWebhookEventRecord,
  UsageEvent,
  WorkspaceAuditExportFormat,
  WorkspaceAuditExportResponse,
} from '@ai-war-room/schemas'

const CSV_HEADERS = [
  'recordType',
  'recordId',
  'workspaceId',
  'createdAt',
  'category',
  'status',
  'detail',
] as const

function escapeCsvCell(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return ''
  }

  const stringValue = String(value)

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

function toCsvRow(values: Array<string | number | null | undefined>) {
  return values.map(escapeCsvCell).join(',')
}

function usageEventRow(event: UsageEvent) {
  return toCsvRow([
    'usage_event',
    event.usageEventId,
    event.workspaceId,
    event.createdAt,
    event.phase,
    event.modelProvider,
    `${event.runId} ${event.modelName} tokens=${event.inputTokens + event.outputTokens} cost=${event.estimatedCostUsd}`,
  ])
}

function billingWebhookEventRow(event: BillingWebhookEventRecord) {
  return toCsvRow([
    'billing_webhook_event',
    event.billingWebhookEventId,
    event.workspaceId,
    event.receivedAt,
    event.eventType,
    event.status,
    event.errorMessage ?? event.externalEventId,
  ])
}

function billingNotificationRow(notification: BillingNotificationRecord) {
  return toCsvRow([
    'billing_notification',
    notification.billingNotificationId,
    notification.workspaceId,
    notification.createdAt,
    notification.alertType,
    notification.status,
    notification.message,
  ])
}

function meterUsageReportRow(report: BillingMeterUsageReport) {
  return toCsvRow([
    'meter_usage_report',
    report.billingMeterUsageReportId,
    report.workspaceId,
    report.createdAt,
    report.metric,
    report.status,
    `quantity=${report.quantity}${report.runId ? ` run=${report.runId}` : ''}`,
  ])
}

export function buildWorkspaceAuditExportStats(
  audit: WorkspaceAuditExportResponse,
) {
  return {
    usageEventCount: audit.usageEvents.length,
    billingWebhookEventCount: audit.billingWebhookEvents.length,
    billingNotificationCount: audit.billingNotifications.length,
    meterUsageReportCount: audit.meterUsageReports.length,
  }
}

export function serializeWorkspaceAuditCsv(audit: WorkspaceAuditExportResponse) {
  const rows = [
    CSV_HEADERS.join(','),
    ...audit.usageEvents.map(usageEventRow),
    ...audit.billingWebhookEvents.map(billingWebhookEventRow),
    ...audit.billingNotifications.map(billingNotificationRow),
    ...audit.meterUsageReports.map(meterUsageReportRow),
  ]

  return rows.join('\n')
}

export function buildWorkspaceAuditExportFilename(
  workspaceId: string,
  format: WorkspaceAuditExportFormat,
) {
  const date = new Date().toISOString().slice(0, 10)

  return `${workspaceId}-audit-${date}.${format}`
}
