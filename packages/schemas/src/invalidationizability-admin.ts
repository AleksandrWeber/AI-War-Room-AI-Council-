import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const invalidationizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type InvalidationizabilityAdminDomain = z.infer<typeof invalidationizabilityAdminDomainSchema>

export const invalidationizabilityAdminRecordSchema = z.object({
  domain: invalidationizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type InvalidationizabilityAdminRecord = z.infer<typeof invalidationizabilityAdminRecordSchema>

export const invalidationizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  invalidationizabilityPercent: z.number().min(0).max(100),
})
export type InvalidationizabilityAdminStats = z.infer<typeof invalidationizabilityAdminStatsSchema>

export const invalidationizabilityAdminActionSchema = z.enum(['refresh_invalidationizability_summary'])
export type InvalidationizabilityAdminAction = z.infer<typeof invalidationizabilityAdminActionSchema>

export const invalidationizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(invalidationizabilityAdminRecordSchema),
  stats: invalidationizabilityAdminStatsSchema,
  availableActions: z.array(invalidationizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type InvalidationizabilityAdminSummaryResponse = z.infer<
  typeof invalidationizabilityAdminSummaryResponseSchema
>

export const invalidationizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: invalidationizabilityAdminActionSchema,
})
export type InvalidationizabilityAdminActionRequest = z.infer<
  typeof invalidationizabilityAdminActionRequestSchema
>

export const invalidationizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: invalidationizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: invalidationizabilityAdminStatsSchema.optional(),
})
export type InvalidationizabilityAdminActionResponse = z.infer<
  typeof invalidationizabilityAdminActionResponseSchema
>
