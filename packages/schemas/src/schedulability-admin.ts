import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const schedulabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type SchedulabilityAdminDomain = z.infer<typeof schedulabilityAdminDomainSchema>

export const schedulabilityAdminRecordSchema = z.object({
  domain: schedulabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SchedulabilityAdminRecord = z.infer<typeof schedulabilityAdminRecordSchema>

export const schedulabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  schedulabilityPercent: z.number().min(0).max(100),
})
export type SchedulabilityAdminStats = z.infer<typeof schedulabilityAdminStatsSchema>

export const schedulabilityAdminActionSchema = z.enum(['refresh_schedulability_summary'])
export type SchedulabilityAdminAction = z.infer<typeof schedulabilityAdminActionSchema>

export const schedulabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(schedulabilityAdminRecordSchema),
  stats: schedulabilityAdminStatsSchema,
  availableActions: z.array(schedulabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SchedulabilityAdminSummaryResponse = z.infer<
  typeof schedulabilityAdminSummaryResponseSchema
>

export const schedulabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: schedulabilityAdminActionSchema,
})
export type SchedulabilityAdminActionRequest = z.infer<
  typeof schedulabilityAdminActionRequestSchema
>

export const schedulabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: schedulabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: schedulabilityAdminStatsSchema.optional(),
})
export type SchedulabilityAdminActionResponse = z.infer<
  typeof schedulabilityAdminActionResponseSchema
>
