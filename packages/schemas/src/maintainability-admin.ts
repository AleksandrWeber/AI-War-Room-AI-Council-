import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const maintainabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'usage_events',
])
export type MaintainabilityAdminDomain = z.infer<
  typeof maintainabilityAdminDomainSchema
>

export const maintainabilityAdminRecordSchema = z.object({
  domain: maintainabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type MaintainabilityAdminRecord = z.infer<
  typeof maintainabilityAdminRecordSchema
>

export const maintainabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  maintainabilityPercent: z.number().min(0).max(100),
})
export type MaintainabilityAdminStats = z.infer<
  typeof maintainabilityAdminStatsSchema
>

export const maintainabilityAdminActionSchema = z.enum([
  'refresh_maintainability_summary',
])
export type MaintainabilityAdminAction = z.infer<
  typeof maintainabilityAdminActionSchema
>

export const maintainabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(maintainabilityAdminRecordSchema),
  stats: maintainabilityAdminStatsSchema,
  availableActions: z.array(maintainabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type MaintainabilityAdminSummaryResponse = z.infer<
  typeof maintainabilityAdminSummaryResponseSchema
>

export const maintainabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: maintainabilityAdminActionSchema,
})
export type MaintainabilityAdminActionRequest = z.infer<
  typeof maintainabilityAdminActionRequestSchema
>

export const maintainabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: maintainabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: maintainabilityAdminStatsSchema.optional(),
})
export type MaintainabilityAdminActionResponse = z.infer<
  typeof maintainabilityAdminActionResponseSchema
>
