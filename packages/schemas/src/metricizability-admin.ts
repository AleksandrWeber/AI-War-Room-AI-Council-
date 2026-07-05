import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const metricizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type MetricizabilityAdminDomain = z.infer<typeof metricizabilityAdminDomainSchema>

export const metricizabilityAdminRecordSchema = z.object({
  domain: metricizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type MetricizabilityAdminRecord = z.infer<typeof metricizabilityAdminRecordSchema>

export const metricizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  metricizabilityPercent: z.number().min(0).max(100),
})
export type MetricizabilityAdminStats = z.infer<typeof metricizabilityAdminStatsSchema>

export const metricizabilityAdminActionSchema = z.enum(['refresh_metricizability_summary'])
export type MetricizabilityAdminAction = z.infer<typeof metricizabilityAdminActionSchema>

export const metricizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(metricizabilityAdminRecordSchema),
  stats: metricizabilityAdminStatsSchema,
  availableActions: z.array(metricizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type MetricizabilityAdminSummaryResponse = z.infer<
  typeof metricizabilityAdminSummaryResponseSchema
>

export const metricizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: metricizabilityAdminActionSchema,
})
export type MetricizabilityAdminActionRequest = z.infer<
  typeof metricizabilityAdminActionRequestSchema
>

export const metricizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: metricizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: metricizabilityAdminStatsSchema.optional(),
})
export type MetricizabilityAdminActionResponse = z.infer<
  typeof metricizabilityAdminActionResponseSchema
>
