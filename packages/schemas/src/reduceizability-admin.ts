import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const reduceizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type ReduceizabilityAdminDomain = z.infer<typeof reduceizabilityAdminDomainSchema>

export const reduceizabilityAdminRecordSchema = z.object({
  domain: reduceizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ReduceizabilityAdminRecord = z.infer<typeof reduceizabilityAdminRecordSchema>

export const reduceizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  reduceizabilityPercent: z.number().min(0).max(100),
})
export type ReduceizabilityAdminStats = z.infer<typeof reduceizabilityAdminStatsSchema>

export const reduceizabilityAdminActionSchema = z.enum(['refresh_reduceizability_summary'])
export type ReduceizabilityAdminAction = z.infer<typeof reduceizabilityAdminActionSchema>

export const reduceizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(reduceizabilityAdminRecordSchema),
  stats: reduceizabilityAdminStatsSchema,
  availableActions: z.array(reduceizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ReduceizabilityAdminSummaryResponse = z.infer<
  typeof reduceizabilityAdminSummaryResponseSchema
>

export const reduceizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: reduceizabilityAdminActionSchema,
})
export type ReduceizabilityAdminActionRequest = z.infer<
  typeof reduceizabilityAdminActionRequestSchema
>

export const reduceizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: reduceizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: reduceizabilityAdminStatsSchema.optional(),
})
export type ReduceizabilityAdminActionResponse = z.infer<
  typeof reduceizabilityAdminActionResponseSchema
>
