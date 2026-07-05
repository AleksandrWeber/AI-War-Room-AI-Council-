import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const efficiencyAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'usage_events',
  'workspace_usage_limits',
])
export type EfficiencyAdminDomain = z.infer<typeof efficiencyAdminDomainSchema>

export const efficiencyAdminRecordSchema = z.object({
  domain: efficiencyAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type EfficiencyAdminRecord = z.infer<typeof efficiencyAdminRecordSchema>

export const efficiencyAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  efficiencyPercent: z.number().min(0).max(100),
})
export type EfficiencyAdminStats = z.infer<typeof efficiencyAdminStatsSchema>

export const efficiencyAdminActionSchema = z.enum([
  'refresh_efficiency_summary',
])
export type EfficiencyAdminAction = z.infer<typeof efficiencyAdminActionSchema>

export const efficiencyAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(efficiencyAdminRecordSchema),
  stats: efficiencyAdminStatsSchema,
  availableActions: z.array(efficiencyAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type EfficiencyAdminSummaryResponse = z.infer<
  typeof efficiencyAdminSummaryResponseSchema
>

export const efficiencyAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: efficiencyAdminActionSchema,
})
export type EfficiencyAdminActionRequest = z.infer<
  typeof efficiencyAdminActionRequestSchema
>

export const efficiencyAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: efficiencyAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: efficiencyAdminStatsSchema.optional(),
})
export type EfficiencyAdminActionResponse = z.infer<
  typeof efficiencyAdminActionResponseSchema
>
