import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const noticeabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type NoticeabilityAdminDomain = z.infer<typeof noticeabilityAdminDomainSchema>

export const noticeabilityAdminRecordSchema = z.object({
  domain: noticeabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type NoticeabilityAdminRecord = z.infer<typeof noticeabilityAdminRecordSchema>

export const noticeabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  noticeabilityPercent: z.number().min(0).max(100),
})
export type NoticeabilityAdminStats = z.infer<typeof noticeabilityAdminStatsSchema>

export const noticeabilityAdminActionSchema = z.enum(['refresh_noticeability_summary'])
export type NoticeabilityAdminAction = z.infer<typeof noticeabilityAdminActionSchema>

export const noticeabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(noticeabilityAdminRecordSchema),
  stats: noticeabilityAdminStatsSchema,
  availableActions: z.array(noticeabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type NoticeabilityAdminSummaryResponse = z.infer<
  typeof noticeabilityAdminSummaryResponseSchema
>

export const noticeabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: noticeabilityAdminActionSchema,
})
export type NoticeabilityAdminActionRequest = z.infer<
  typeof noticeabilityAdminActionRequestSchema
>

export const noticeabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: noticeabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: noticeabilityAdminStatsSchema.optional(),
})
export type NoticeabilityAdminActionResponse = z.infer<
  typeof noticeabilityAdminActionResponseSchema
>
