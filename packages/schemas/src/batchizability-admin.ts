import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const batchizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type BatchizabilityAdminDomain = z.infer<typeof batchizabilityAdminDomainSchema>

export const batchizabilityAdminRecordSchema = z.object({
  domain: batchizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type BatchizabilityAdminRecord = z.infer<typeof batchizabilityAdminRecordSchema>

export const batchizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  batchizabilityPercent: z.number().min(0).max(100),
})
export type BatchizabilityAdminStats = z.infer<typeof batchizabilityAdminStatsSchema>

export const batchizabilityAdminActionSchema = z.enum(['refresh_batchizability_summary'])
export type BatchizabilityAdminAction = z.infer<typeof batchizabilityAdminActionSchema>

export const batchizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(batchizabilityAdminRecordSchema),
  stats: batchizabilityAdminStatsSchema,
  availableActions: z.array(batchizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type BatchizabilityAdminSummaryResponse = z.infer<
  typeof batchizabilityAdminSummaryResponseSchema
>

export const batchizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: batchizabilityAdminActionSchema,
})
export type BatchizabilityAdminActionRequest = z.infer<
  typeof batchizabilityAdminActionRequestSchema
>

export const batchizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: batchizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: batchizabilityAdminStatsSchema.optional(),
})
export type BatchizabilityAdminActionResponse = z.infer<
  typeof batchizabilityAdminActionResponseSchema
>
