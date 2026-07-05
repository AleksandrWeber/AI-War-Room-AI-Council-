import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const batchingizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type BatchingizabilityAdminDomain = z.infer<typeof batchingizabilityAdminDomainSchema>

export const batchingizabilityAdminRecordSchema = z.object({
  domain: batchingizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type BatchingizabilityAdminRecord = z.infer<typeof batchingizabilityAdminRecordSchema>

export const batchingizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  batchingizabilityPercent: z.number().min(0).max(100),
})
export type BatchingizabilityAdminStats = z.infer<typeof batchingizabilityAdminStatsSchema>

export const batchingizabilityAdminActionSchema = z.enum(['refresh_batchingizability_summary'])
export type BatchingizabilityAdminAction = z.infer<typeof batchingizabilityAdminActionSchema>

export const batchingizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(batchingizabilityAdminRecordSchema),
  stats: batchingizabilityAdminStatsSchema,
  availableActions: z.array(batchingizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type BatchingizabilityAdminSummaryResponse = z.infer<
  typeof batchingizabilityAdminSummaryResponseSchema
>

export const batchingizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: batchingizabilityAdminActionSchema,
})
export type BatchingizabilityAdminActionRequest = z.infer<
  typeof batchingizabilityAdminActionRequestSchema
>

export const batchingizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: batchingizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: batchingizabilityAdminStatsSchema.optional(),
})
export type BatchingizabilityAdminActionResponse = z.infer<
  typeof batchingizabilityAdminActionResponseSchema
>
