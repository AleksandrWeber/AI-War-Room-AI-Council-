import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const indexizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type IndexizabilityAdminDomain = z.infer<typeof indexizabilityAdminDomainSchema>

export const indexizabilityAdminRecordSchema = z.object({
  domain: indexizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type IndexizabilityAdminRecord = z.infer<typeof indexizabilityAdminRecordSchema>

export const indexizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  indexizabilityPercent: z.number().min(0).max(100),
})
export type IndexizabilityAdminStats = z.infer<typeof indexizabilityAdminStatsSchema>

export const indexizabilityAdminActionSchema = z.enum(['refresh_indexizability_summary'])
export type IndexizabilityAdminAction = z.infer<typeof indexizabilityAdminActionSchema>

export const indexizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(indexizabilityAdminRecordSchema),
  stats: indexizabilityAdminStatsSchema,
  availableActions: z.array(indexizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type IndexizabilityAdminSummaryResponse = z.infer<
  typeof indexizabilityAdminSummaryResponseSchema
>

export const indexizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: indexizabilityAdminActionSchema,
})
export type IndexizabilityAdminActionRequest = z.infer<
  typeof indexizabilityAdminActionRequestSchema
>

export const indexizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: indexizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: indexizabilityAdminStatsSchema.optional(),
})
export type IndexizabilityAdminActionResponse = z.infer<
  typeof indexizabilityAdminActionResponseSchema
>
