import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const schedulingizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type SchedulingizabilityAdminDomain = z.infer<typeof schedulingizabilityAdminDomainSchema>

export const schedulingizabilityAdminRecordSchema = z.object({
  domain: schedulingizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SchedulingizabilityAdminRecord = z.infer<typeof schedulingizabilityAdminRecordSchema>

export const schedulingizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  schedulingizabilityPercent: z.number().min(0).max(100),
})
export type SchedulingizabilityAdminStats = z.infer<typeof schedulingizabilityAdminStatsSchema>

export const schedulingizabilityAdminActionSchema = z.enum(['refresh_schedulingizability_summary'])
export type SchedulingizabilityAdminAction = z.infer<typeof schedulingizabilityAdminActionSchema>

export const schedulingizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(schedulingizabilityAdminRecordSchema),
  stats: schedulingizabilityAdminStatsSchema,
  availableActions: z.array(schedulingizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SchedulingizabilityAdminSummaryResponse = z.infer<
  typeof schedulingizabilityAdminSummaryResponseSchema
>

export const schedulingizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: schedulingizabilityAdminActionSchema,
})
export type SchedulingizabilityAdminActionRequest = z.infer<
  typeof schedulingizabilityAdminActionRequestSchema
>

export const schedulingizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: schedulingizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: schedulingizabilityAdminStatsSchema.optional(),
})
export type SchedulingizabilityAdminActionResponse = z.infer<
  typeof schedulingizabilityAdminActionResponseSchema
>
