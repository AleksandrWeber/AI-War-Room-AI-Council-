import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const indexingizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type IndexingizabilityAdminDomain = z.infer<typeof indexingizabilityAdminDomainSchema>

export const indexingizabilityAdminRecordSchema = z.object({
  domain: indexingizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type IndexingizabilityAdminRecord = z.infer<typeof indexingizabilityAdminRecordSchema>

export const indexingizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  indexingizabilityPercent: z.number().min(0).max(100),
})
export type IndexingizabilityAdminStats = z.infer<typeof indexingizabilityAdminStatsSchema>

export const indexingizabilityAdminActionSchema = z.enum(['refresh_indexingizability_summary'])
export type IndexingizabilityAdminAction = z.infer<typeof indexingizabilityAdminActionSchema>

export const indexingizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(indexingizabilityAdminRecordSchema),
  stats: indexingizabilityAdminStatsSchema,
  availableActions: z.array(indexingizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type IndexingizabilityAdminSummaryResponse = z.infer<
  typeof indexingizabilityAdminSummaryResponseSchema
>

export const indexingizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: indexingizabilityAdminActionSchema,
})
export type IndexingizabilityAdminActionRequest = z.infer<
  typeof indexingizabilityAdminActionRequestSchema
>

export const indexingizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: indexingizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: indexingizabilityAdminStatsSchema.optional(),
})
export type IndexingizabilityAdminActionResponse = z.infer<
  typeof indexingizabilityAdminActionResponseSchema
>
