import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const elasticizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type ElasticizabilityAdminDomain = z.infer<typeof elasticizabilityAdminDomainSchema>

export const elasticizabilityAdminRecordSchema = z.object({
  domain: elasticizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ElasticizabilityAdminRecord = z.infer<typeof elasticizabilityAdminRecordSchema>

export const elasticizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  elasticizabilityPercent: z.number().min(0).max(100),
})
export type ElasticizabilityAdminStats = z.infer<typeof elasticizabilityAdminStatsSchema>

export const elasticizabilityAdminActionSchema = z.enum(['refresh_elasticizability_summary'])
export type ElasticizabilityAdminAction = z.infer<typeof elasticizabilityAdminActionSchema>

export const elasticizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(elasticizabilityAdminRecordSchema),
  stats: elasticizabilityAdminStatsSchema,
  availableActions: z.array(elasticizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ElasticizabilityAdminSummaryResponse = z.infer<
  typeof elasticizabilityAdminSummaryResponseSchema
>

export const elasticizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: elasticizabilityAdminActionSchema,
})
export type ElasticizabilityAdminActionRequest = z.infer<
  typeof elasticizabilityAdminActionRequestSchema
>

export const elasticizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: elasticizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: elasticizabilityAdminStatsSchema.optional(),
})
export type ElasticizabilityAdminActionResponse = z.infer<
  typeof elasticizabilityAdminActionResponseSchema
>
