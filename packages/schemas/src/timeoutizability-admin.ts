import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const timeoutizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type TimeoutizabilityAdminDomain = z.infer<typeof timeoutizabilityAdminDomainSchema>

export const timeoutizabilityAdminRecordSchema = z.object({
  domain: timeoutizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TimeoutizabilityAdminRecord = z.infer<typeof timeoutizabilityAdminRecordSchema>

export const timeoutizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  timeoutizabilityPercent: z.number().min(0).max(100),
})
export type TimeoutizabilityAdminStats = z.infer<typeof timeoutizabilityAdminStatsSchema>

export const timeoutizabilityAdminActionSchema = z.enum(['refresh_timeoutizability_summary'])
export type TimeoutizabilityAdminAction = z.infer<typeof timeoutizabilityAdminActionSchema>

export const timeoutizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(timeoutizabilityAdminRecordSchema),
  stats: timeoutizabilityAdminStatsSchema,
  availableActions: z.array(timeoutizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TimeoutizabilityAdminSummaryResponse = z.infer<
  typeof timeoutizabilityAdminSummaryResponseSchema
>

export const timeoutizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: timeoutizabilityAdminActionSchema,
})
export type TimeoutizabilityAdminActionRequest = z.infer<
  typeof timeoutizabilityAdminActionRequestSchema
>

export const timeoutizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: timeoutizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: timeoutizabilityAdminStatsSchema.optional(),
})
export type TimeoutizabilityAdminActionResponse = z.infer<
  typeof timeoutizabilityAdminActionResponseSchema
>
