import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const shardingizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type ShardingizabilityAdminDomain = z.infer<typeof shardingizabilityAdminDomainSchema>

export const shardingizabilityAdminRecordSchema = z.object({
  domain: shardingizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ShardingizabilityAdminRecord = z.infer<typeof shardingizabilityAdminRecordSchema>

export const shardingizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  shardingizabilityPercent: z.number().min(0).max(100),
})
export type ShardingizabilityAdminStats = z.infer<typeof shardingizabilityAdminStatsSchema>

export const shardingizabilityAdminActionSchema = z.enum(['refresh_shardingizability_summary'])
export type ShardingizabilityAdminAction = z.infer<typeof shardingizabilityAdminActionSchema>

export const shardingizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(shardingizabilityAdminRecordSchema),
  stats: shardingizabilityAdminStatsSchema,
  availableActions: z.array(shardingizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ShardingizabilityAdminSummaryResponse = z.infer<
  typeof shardingizabilityAdminSummaryResponseSchema
>

export const shardingizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: shardingizabilityAdminActionSchema,
})
export type ShardingizabilityAdminActionRequest = z.infer<
  typeof shardingizabilityAdminActionRequestSchema
>

export const shardingizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: shardingizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: shardingizabilityAdminStatsSchema.optional(),
})
export type ShardingizabilityAdminActionResponse = z.infer<
  typeof shardingizabilityAdminActionResponseSchema
>
