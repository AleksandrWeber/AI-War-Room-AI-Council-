import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const migratizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type MigratizabilityAdminDomain = z.infer<typeof migratizabilityAdminDomainSchema>

export const migratizabilityAdminRecordSchema = z.object({
  domain: migratizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type MigratizabilityAdminRecord = z.infer<typeof migratizabilityAdminRecordSchema>

export const migratizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  migratizabilityPercent: z.number().min(0).max(100),
})
export type MigratizabilityAdminStats = z.infer<typeof migratizabilityAdminStatsSchema>

export const migratizabilityAdminActionSchema = z.enum(['refresh_migratizability_summary'])
export type MigratizabilityAdminAction = z.infer<typeof migratizabilityAdminActionSchema>

export const migratizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(migratizabilityAdminRecordSchema),
  stats: migratizabilityAdminStatsSchema,
  availableActions: z.array(migratizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type MigratizabilityAdminSummaryResponse = z.infer<
  typeof migratizabilityAdminSummaryResponseSchema
>

export const migratizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: migratizabilityAdminActionSchema,
})
export type MigratizabilityAdminActionRequest = z.infer<
  typeof migratizabilityAdminActionRequestSchema
>

export const migratizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: migratizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: migratizabilityAdminStatsSchema.optional(),
})
export type MigratizabilityAdminActionResponse = z.infer<
  typeof migratizabilityAdminActionResponseSchema
>
