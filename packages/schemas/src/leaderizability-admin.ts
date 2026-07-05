import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const leaderizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type LeaderizabilityAdminDomain = z.infer<typeof leaderizabilityAdminDomainSchema>

export const leaderizabilityAdminRecordSchema = z.object({
  domain: leaderizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type LeaderizabilityAdminRecord = z.infer<typeof leaderizabilityAdminRecordSchema>

export const leaderizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  leaderizabilityPercent: z.number().min(0).max(100),
})
export type LeaderizabilityAdminStats = z.infer<typeof leaderizabilityAdminStatsSchema>

export const leaderizabilityAdminActionSchema = z.enum(['refresh_leaderizability_summary'])
export type LeaderizabilityAdminAction = z.infer<typeof leaderizabilityAdminActionSchema>

export const leaderizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(leaderizabilityAdminRecordSchema),
  stats: leaderizabilityAdminStatsSchema,
  availableActions: z.array(leaderizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type LeaderizabilityAdminSummaryResponse = z.infer<
  typeof leaderizabilityAdminSummaryResponseSchema
>

export const leaderizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: leaderizabilityAdminActionSchema,
})
export type LeaderizabilityAdminActionRequest = z.infer<
  typeof leaderizabilityAdminActionRequestSchema
>

export const leaderizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: leaderizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: leaderizabilityAdminStatsSchema.optional(),
})
export type LeaderizabilityAdminActionResponse = z.infer<
  typeof leaderizabilityAdminActionResponseSchema
>
