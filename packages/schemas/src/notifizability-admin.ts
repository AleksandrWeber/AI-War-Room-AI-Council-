import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const notifizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type NotifizabilityAdminDomain = z.infer<typeof notifizabilityAdminDomainSchema>

export const notifizabilityAdminRecordSchema = z.object({
  domain: notifizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type NotifizabilityAdminRecord = z.infer<typeof notifizabilityAdminRecordSchema>

export const notifizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  notifizabilityPercent: z.number().min(0).max(100),
})
export type NotifizabilityAdminStats = z.infer<typeof notifizabilityAdminStatsSchema>

export const notifizabilityAdminActionSchema = z.enum(['refresh_notifizability_summary'])
export type NotifizabilityAdminAction = z.infer<typeof notifizabilityAdminActionSchema>

export const notifizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(notifizabilityAdminRecordSchema),
  stats: notifizabilityAdminStatsSchema,
  availableActions: z.array(notifizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type NotifizabilityAdminSummaryResponse = z.infer<
  typeof notifizabilityAdminSummaryResponseSchema
>

export const notifizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: notifizabilityAdminActionSchema,
})
export type NotifizabilityAdminActionRequest = z.infer<
  typeof notifizabilityAdminActionRequestSchema
>

export const notifizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: notifizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: notifizabilityAdminStatsSchema.optional(),
})
export type NotifizabilityAdminActionResponse = z.infer<
  typeof notifizabilityAdminActionResponseSchema
>
