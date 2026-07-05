import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const triggeringizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type TriggeringizabilityAdminDomain = z.infer<typeof triggeringizabilityAdminDomainSchema>

export const triggeringizabilityAdminRecordSchema = z.object({
  domain: triggeringizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TriggeringizabilityAdminRecord = z.infer<typeof triggeringizabilityAdminRecordSchema>

export const triggeringizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  triggeringizabilityPercent: z.number().min(0).max(100),
})
export type TriggeringizabilityAdminStats = z.infer<typeof triggeringizabilityAdminStatsSchema>

export const triggeringizabilityAdminActionSchema = z.enum(['refresh_triggeringizability_summary'])
export type TriggeringizabilityAdminAction = z.infer<typeof triggeringizabilityAdminActionSchema>

export const triggeringizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(triggeringizabilityAdminRecordSchema),
  stats: triggeringizabilityAdminStatsSchema,
  availableActions: z.array(triggeringizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TriggeringizabilityAdminSummaryResponse = z.infer<
  typeof triggeringizabilityAdminSummaryResponseSchema
>

export const triggeringizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: triggeringizabilityAdminActionSchema,
})
export type TriggeringizabilityAdminActionRequest = z.infer<
  typeof triggeringizabilityAdminActionRequestSchema
>

export const triggeringizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: triggeringizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: triggeringizabilityAdminStatsSchema.optional(),
})
export type TriggeringizabilityAdminActionResponse = z.infer<
  typeof triggeringizabilityAdminActionResponseSchema
>
