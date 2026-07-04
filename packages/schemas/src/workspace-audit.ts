import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'
import {
  billingMeterUsageReportSchema,
  billingNotificationRecordSchema,
  billingWebhookEventRecordSchema,
} from './billing.js'
import { usageEventSchema } from './usage.js'

export const workspaceAuditExportFormatSchema = z.enum(['csv', 'json'])
export type WorkspaceAuditExportFormat = z.infer<
  typeof workspaceAuditExportFormatSchema
>

export const workspaceAuditExportStatsSchema = z.object({
  usageEventCount: z.number().int().nonnegative(),
  billingWebhookEventCount: z.number().int().nonnegative(),
  billingNotificationCount: z.number().int().nonnegative(),
  meterUsageReportCount: z.number().int().nonnegative(),
})
export type WorkspaceAuditExportStats = z.infer<
  typeof workspaceAuditExportStatsSchema
>

export const workspaceAuditExportResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  exportedAt: utcDateStringSchema,
  stats: workspaceAuditExportStatsSchema,
  usageEvents: z.array(usageEventSchema),
  billingWebhookEvents: z.array(billingWebhookEventRecordSchema),
  billingNotifications: z.array(billingNotificationRecordSchema),
  meterUsageReports: z.array(billingMeterUsageReportSchema),
})
export type WorkspaceAuditExportResponse = z.infer<
  typeof workspaceAuditExportResponseSchema
>
